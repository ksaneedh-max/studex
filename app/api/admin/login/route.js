export async function POST(req) {
  try {
    const { id, password } = await req.json();

    if (
      id === process.env.ADMIN_ID &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  } catch {
    return Response.json({
      success: false,
      message: "Login failed",
    });
  }
}