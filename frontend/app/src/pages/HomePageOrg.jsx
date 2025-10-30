import ScholarshipCard from "../components/ScholarshipCard";
import Button from "../components/Button";

function HomePageOrg() {
  //Sample data:
  const scholarships = [
    {
      id: 1,
      title: "Excellence Scholarship",
      organization: "City Foundation",
      amount: "€1,000",
      deadline: "Nov 30, 2025",
      tags: ["Undergraduate", "Merit", "Europe"],
      description:
        "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
      link: "#",
    },
    {
      id: 2,
      title: "Women in Tech Grant",
      organization: "TechForward",
      amount: "€2,500",
      deadline: "Dec 15, 2025",
      tags: ["STEM", "Graduate", "Diversity"],
      description:
        "Supports women pursuing degrees in technology and engineering. Applicants should submit a project summary and transcript.",
      link: "#",
    },
    {
      id: 3,
      title: "Local Artist Award",
      organization: "Arts Council",
      amount: "€750",
      deadline: "Jan 10, 2026",
      tags: ["Arts", "Portfolio"],
      description:
        "Small grant for local emerging artists to support the creation of new work. Portfolio and artist statement required.",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-5xl font-bold text-blue-400">Stipendify</h1>
          <p className="text-md text-gray-600 font-bold mt-1">
            Objavi vlastite stipendije!
          </p>
        </header>

        <div className="flex">
          <section className="max-w-7xl mx-auto p-6 w-[35%]">
            <div className="flex justify-center items-center">
              <h2 className="text-2xl font-semibold mb-4">Moje stipendije:</h2>
              <Button className="w-[40%] ml-auto mb-4 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
                Objavi novu stipendiju
              </Button>
            </div>
            <ul className="divide-y divide-gray-200">
              {scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </ul>
          </section>

          <section className="max-w-7xl mx-auto p-6 w-[35%]">
            <h2 className="text-2xl font-semibold mb-4">
              Državne i javne stipendije:
            </h2>
            <ul className="divide-y divide-gray-200">
              {scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </ul>
          </section>

          <aside className="hidden lg:block lg:col-span-1 w-[30%]">
            <div className="h-full min-h-[150px] rounded-lg border-2 border-dashed border-gray-200 bg-white/50 flex items-center justify-center text-gray-400">
              Calendar and mail notifications (coming soon)
            </div>
          </aside>
        </div>
        <footer className="min-h-[150px] bg-blue-400">
            <p>Footer</p>
        </footer>
      </div>
    </div>
  );
}

export default HomePageOrg;
