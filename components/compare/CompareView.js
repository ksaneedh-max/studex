"use client";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function CompareView({ data }) {
  const format = (n) => {
    const num = Number(n) || 0;
    return Number.isInteger(num) ? num : num.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {data.map((s, i) => {
        const users = s.components[Object.keys(s.components)[0]].scores;

        return (
          <Card key={i} className="p-5">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <SectionTitle>{s.title}</SectionTitle>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {s.type}
              </span>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                {/* USER HEADER */}
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 text-gray-500">Component</th>

                    {users.map((u, idx) => (
                      <th key={idx} className="py-2 text-center">
                        {u.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {Object.entries(s.components).map(([comp, val]) => {

                    const topper = val.scores.reduce((a, b) =>
                      b.obtained > a.obtained ? b : a
                    );

                    return (
                      <tr key={comp} className="border-b">

                        {/* COMPONENT NAME */}
                        <td className="py-3 font-medium text-gray-700">
                          {comp}
                          <div className="text-xs text-gray-400">
                            / {format(val.max)}
                          </div>
                        </td>

                        {/* USER SCORES */}
                        {val.scores.map((u, idx) => {
                          const percent =
                            val.max > 0
                              ? (u.obtained / val.max) * 100
                              : 0;

                          const isTopper = u.name === topper.name;

                          return (
                            <td key={idx} className="py-3 px-2">

                              {/* SCORE */}
                              <div className="text-center text-xs mb-1">
                                <span
                                  className={`font-semibold ${
                                    isTopper
                                      ? "text-green-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {format(u.obtained)}
                                </span>

                                <span className="text-gray-400 ml-1">
                                  ({percent.toFixed(0)}%)
                                </span>

                                {isTopper && " 🏆"}
                              </div>

                              {/* BAR */}
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    isTopper
                                      ? "bg-green-500"
                                      : "bg-gray-800"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}