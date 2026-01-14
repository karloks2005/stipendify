import ScholarshipCard from "../components/ScholarshipCard";
import Button from "../components/Button";

function HomePageOrg() {
  const scholarships = [
    {
      id: 1,
      title: "Stipendija Grada Zagreba za izvrsnost",
      organization: "Grad Šibenik",
      amount: "520€",
      deadline: "14.11.2025",
      description:
        "Stipendija Grada Zagreba, koja je prepoznata kao stipendija za izvrsnost, namijenjena je najuspješnijim studentima...",
    },
    {
      id: 2,
      title: "Stipendija Grada Zagreba za izvrsnost",
      organization: "Grad Šibenik",
      amount: "520€",
      deadline: "14.11.2025",
      description:
        "Stipendija Grada Zagreba, koja je prepoznata kao stipendija za izvrsnost, namijenjena je najuspješnijim studentima...",
    },
  ];

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="max-w-full">
        {/* Header */}
        <header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-xl mb-6">
          <div className="ml-12">
            <h1 className="text-[62px] font-bold text-blue-500 my-2">STIPENDIFY</h1>
            <p className="text-[28px] text-gray-500 my-2 font-semibold">Objavi vlastite stipendije!</p>
          </div>
          <div className="text-gray-600 font-semibold text-[20px]">Ime i prezime</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 m-12">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[24px] font-semibold">Moje stipendije</h2>
              <button className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 shadow-xl text-[16px] font-semibold">
                Dodaj novu stipendiju
              </button>
            </div>

            {scholarships.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}

            <h2 className="text-[24px] font-semibold pt-4">Stipendije</h2>

            {scholarships.map((s) => (
              <ScholarshipCard key={`public-${s.id}`} scholarship={s} />
            ))}
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="font-semibold mb-3">June 2024</h3>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-full ${i === 25 ? "bg-blue-500 text-white" : "text-gray-700"}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow p-6 flex items-center justify-center text-gray-600">
              E-mail reminder!
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default HomePageOrg;