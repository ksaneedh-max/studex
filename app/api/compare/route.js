import { systemRedis as redis } from "@/lib/redis"; // ✅ switched to systemRedis
import { nanoid } from "nanoid";

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, code, name, marks, maxUsers, semester } = body;

    // =========================
    // 🔹 CREATE LOBBY
    // =========================
    if (action === "create") {
      const newCode = nanoid(6);
      const now = Date.now();
      const TTL = 60 * 60;

      const creatorId = nanoid();

      // 🔥 FINAL FIX: STRICT SEMESTER SOURCE
      const finalSemester = semester ?? null;

      const payload = {
        created_at: now,
        expires_at: now + TTL * 1000,
        max_users: maxUsers || 3,
        status: "lobby",
        semester: finalSemester,
        creator_id: creatorId,
        users: [
          {
            id: creatorId,
            name: name || "User",
            marks: optimizeMarks(marks),
          },
        ],
      };

      await redis.set(`compare:${newCode}`, payload, { ex: TTL });

      return Response.json({
        success: true,
        code: newCode,
        userId: creatorId,
      });
    }

    // =========================
    // 🔹 JOIN
    // =========================
    if (action === "join") {
      const key = `compare:${code}`;
      const room = await redis.get(key);

      if (!room) {
        return Response.json({ success: false, message: "Expired" });
      }

      if (room.status !== "lobby") {
        return Response.json({ success: false, message: "Already started" });
      }

      if (room.users.length >= room.max_users) {
        return Response.json({ success: false, message: "Room full" });
      }

      // 🔥 BLOCK DIFFERENT SEMESTERS
      if (
        room.semester &&
        semester &&
        String(room.semester) !== String(semester)
      ) {
        return Response.json({
          success: false,
          type: "SEM_MISMATCH",
          message: `Semester mismatch (Room: ${room.semester}, You: ${semester})`,
        });
      }

      const userId = nanoid();

      room.users.push({
        id: userId,
        name: name || "User",
        marks: optimizeMarks(marks),
      });

      await redis.set(key, room, { keepTtl: true });

      return Response.json({ success: true, userId });
    }

    // =========================
    // 🔹 LOBBY FETCH
    // =========================
    if (action === "lobby") {
      const room = await redis.get(`compare:${code}`);

      if (!room) {
        return Response.json({ success: false, message: "Expired" });
      }

      return Response.json({
        success: true,
        status: room.status,
        semester: room.semester,
        users: room.users.map((u) => ({ id: u.id, name: u.name })),
        max_users: room.max_users,
        creator_id: room.creator_id,
      });
    }

    // =========================
    // 🔹 START COMPARE
    // =========================
    if (action === "start") {
      const key = `compare:${code}`;
      const room = await redis.get(key);

      if (!room) {
        return Response.json({ success: false, message: "Expired" });
      }

      room.status = "started";

      await redis.set(key, room, { keepTtl: true });

      return Response.json({ success: true });
    }

    // =========================
    // 🔹 GET RESULT
    // =========================
    if (action === "get") {
      const room = await redis.get(`compare:${code}`);

      if (!room) {
        return Response.json({ success: false, message: "Expired" });
      }

      if (room.status !== "started") {
        return Response.json({ success: false, message: "Not started" });
      }

      return Response.json({
        success: true,
        semester: room.semester,
        data: buildComparison(room.users),
      });
    }

    return Response.json({ success: false, message: "Invalid action" });

  } catch (err) {
    return Response.json({ success: false, message: err.message });
  }
}

// =========================
// 🔥 OPTIMIZE MARKS
// =========================
function optimizeMarks(marks = []) {
  const map = {};

  marks.forEach((m) => {
    const key = m.course_title;

    if (!map[key]) map[key] = [];
    map[key].push(m);
  });

  const filtered = [];

  Object.values(map).forEach((group) => {
    const hasTheory = group.some(
      (g) => g.course_type !== "Practical"
    );

    if (hasTheory) {
      const theory = group.find(
        (g) => g.course_type !== "Practical"
      );
      if (theory) filtered.push(theory);
    } else {
      filtered.push(...group);
    }
  });

  return filtered.map((m) => ({
    title: m.course_title,
    type: m.course_type,
    totalObtained: m.totalObtained,
    totalMax: m.totalMax,
    tests: (m.tests || []).map((t) => ({
      name: t.name,
      obtained: t.obtained,
      max: t.max,
    })),
  }));
}

// =========================
// 🧠 BUILD COMPARISON
// =========================
function buildComparison(users) {
  const subjects = getCommonSubjects(users);

  return subjects.map((key) => {
    const [title, type] = key.split("||");

    const subject = {
      title,
      type,
      components: {},
    };

    users.forEach((u) => {
      const m = u.marks.find(
        (x) => x.title === title && x.type === type
      );

      if (!m) return;

      (m.tests || []).forEach((t) => {
        if (!subject.components[t.name]) {
          subject.components[t.name] = {
            max: t.max,
            scores: [],
          };
        }

        subject.components[t.name].scores.push({
          name: u.name,
          obtained: t.obtained,
        });
      });
    });

    return subject;
  });
}

// =========================
// 🧠 COMMON SUBJECTS
// =========================
function getCommonSubjects(users) {
  const sets = users.map((u) =>
    new Set(u.marks.map((m) => `${m.title}||${m.type}`))
  );

  return [
    ...sets.reduce((a, b) =>
      new Set([...a].filter((x) => b.has(x)))
    ),
  ];
}