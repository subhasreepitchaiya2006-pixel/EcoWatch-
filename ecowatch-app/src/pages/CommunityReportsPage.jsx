import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

const CATEGORY_OPTIONS = [
  { key: "Flooding", icon: "water_drop", label: "Flooding" },
  { key: "Waste", icon: "delete_sweep", label: "Waste" },
  { key: "Air Pollution", icon: "air", label: "Air Pollution" },
  { key: "Leakage", icon: "opacity", label: "Leakage" },
  { key: "Illegal Tree", icon: "eco", label: "Illegal Tree" },
  { key: "Other", icon: "grid_view", label: "Other" },
];

const STATS = [
  { label: "Total Reports", value: "2,842", suffix: "+12%", tone: "text-secondary" },
  { label: "Active Incidents", value: "148", suffix: "+5", tone: "text-error" },
  { label: "Resolved Cases", value: "2,410", suffix: "84%", tone: "text-secondary" },
  { label: "Avg Response", value: "4.2h", suffix: "-15m", tone: "text-secondary" },
  { label: "Participation", value: "92/100", suffix: "92%", tone: "text-primary" },
];

const REPORTS = [
  {
    id: 1,
    title: "Severe Flooding - Perungudi",
    status: "Urgent",
    statusClass: "bg-error-container text-on-error-container",
    time: "2m ago",
    location: "Velachery Zone 13",
    author: "Rajesh K.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
    description:
      "Water level has crossed 1 foot on 4th Main Road. Drainage seems blocked by plastic waste. Impeding traffic and entry to homes.",
  },
  {
    id: 2,
    title: "Illegal Dumping - Adyar Canal",
    status: "Investigating",
    statusClass: "bg-tertiary-container text-on-tertiary-container",
    time: "15m ago",
    location: "Adyar Zone 13",
    author: "Priya M.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA22ONmigL4UgvPkimLefcF38bcAK5KNXFd1c-YDbkEs68jXUevZa_6FrEcxF3X2xBMq88KcCOma6kOdXFRV0t5ZRCT9L0tjN_H7ShI_9134SRbCGxAq9MpTMAE-8JRskG2oiucyoCgsvPxgMf-xSyt2ww2DWbHKHOO8m6NfXjXEy5Pocxm3KrHAzsFCbTTd2bD-47xsWN1J0O4ACUJvz7bvttCb600hjbFk7eAa16heNDm1IPCVEzkEQ",
    description:
      "Trucks seen dumping construction debris directly into the canal bank during late hours. Odor is becoming problematic.",
  },
  {
    id: 3,
    title: "Main Water Line Leak",
    status: "Resolved",
    statusClass: "bg-secondary-container text-on-secondary-container",
    time: "1h ago",
    location: "T. Nagar Zone 10",
    author: "Suresh V.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCxtkpP1SgaGgiAeoc-fsmV2euLnG-ItoBNfThjH7EsvaFlk0sVU4c1GrQyWa74Yr3gNhm1YVEkdfi-lMpsfCou3BwcpcrKdCCYQYjwNVmnX3VDyU2S2iZ9GmSbTVlpC-29KTj3Abl-UEQhMj5ek2e4ZkER6ogy8zmYbZlxj6EMBpdxkC2v9Ar2VaqVVjjvQA6WgOdSY0xilzFBvZ33EajoYnIIElKl0JZJrV8qNc6YyR1jOtIMYY-8gg",
    description:
      "Metrowater pipe burst near the bus stand. Thousands of gallons being wasted. Reported fixed by maintenance team.",
  },
];

const AI_INSIGHTS = [
  "Increase in flooding reports (14 incidents) near Velachery Main Rd within 2 hours.",
  "Likely correlation between waste pile reports and recent drainage blockages in Adyar.",
  "Report frequency suggests a high risk of water-borne disease cluster in T. Nagar.",
];

const LEADERBOARD = [
  { rank: "01", zone: "Adyar (Zone 13)", reports: 842, resolution: "94%", score: "98%", trend: "trending_up", trendColor: "text-secondary" },
  { rank: "02", zone: "T. Nagar (Zone 10)", reports: 721, resolution: "89%", score: "85%", trend: "trending_up", trendColor: "text-secondary" },
  { rank: "03", zone: "Anna Nagar (Zone 08)", reports: 655, resolution: "82%", score: "78%", trend: "trending_flat", trendColor: "text-tertiary" },
];

export default function CommunityReportsPage() {
  const [activeCategory, setActiveCategory] = useState("Flooding");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Community Intelligence Reports
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Real-time crowdsourced environmental monitoring in Chennai Metro.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary transition-all hover:bg-primary-container active:scale-95">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Report
            </button>
            <button className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-5 py-2.5 font-label-md text-label-md text-on-surface transition-all hover:bg-surface-container">
              <span className="material-symbols-outlined text-[20px]">map</span>
              Map View
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface transition-all hover:bg-surface-container"
              title="Export Summary"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STATS.map((item) => (
            <div
              key={item.label}
              className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_md shadow-ambient"
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {item.label}
              </p>
              <div className="flex items-end justify-between gap-3">
                <span className="font-headline-md text-headline-md text-on-surface">
                  {item.value}
                </span>
                <span className={`font-label-sm text-label-sm ${item.tone}`}>
                  {item.suffix}
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="rounded-xxl bg-surface-container-lowest p-stack_lg shadow-ambient">
              <h3 className="mb-4 border-b border-outline-variant pb-2 font-headline-sm text-headline-sm text-on-surface">
                Categories
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORY_OPTIONS.map((option) => {
                  const isActive = option.key === activeCategory;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setActiveCategory(option.key)}
                      className={`flex min-h-[110px] flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
                        isActive
                          ? "border-primary bg-primary-container/10 text-primary"
                          : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined mb-2 text-4xl ${
                          isActive ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {option.icon}
                      </span>
                      <span className="font-label-md text-label-md">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xxl bg-primary-container p-stack_lg text-on-primary-container shadow-lg">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-on-primary-container/10 blur-2xl" />
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">psychology</span>
                  <h3 className="font-headline-sm text-headline-sm">AI Insights</h3>
                </div>
                <ul className="space-y-4">
                  {AI_INSIGHTS.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-on-primary-container" />
                      <p className="font-body-sm text-body-sm leading-snug">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-6">
            <div className="relative h-[500px] overflow-hidden rounded-xxl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
              <div className="absolute inset-0">
                <img
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4hDPcFoJToq-1hxuvWkJuHjICcgDlIJJR9HwWENIKNJGOrhdAXhgqKw8hBawyDX6c4uUcW92ln0ThNq5ybxfRlXgyBarrq9Q7zTUhFGZda7VD4cFg6VZblvWYhJ5fX1sA0CRn6pN6uX0yXBiie2PBngdAggojP8hG9MV3XVbm_ebbm5XqACaho70VsaR6AS0sBRUIB9Jzce_90l6bYqJfNNWZndLzutzV8H89RjUu3BgAcHKFUQVG3Q"
                  alt="Chennai city map with report markers"
                />
              </div>

              <div className="absolute left-4 top-4 flex flex-col gap-2">
                <div className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface/90 p-1 shadow-sm backdrop-blur">
                  <button className="rounded p-2 transition-colors hover:bg-surface-container-high" type="button">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                  <div className="mx-1 h-px bg-outline-variant" />
                  <button className="rounded p-2 transition-colors hover:bg-surface-container-high" type="button">
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-outline-variant bg-surface/90 p-2 shadow-sm backdrop-blur transition-colors hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined">my_location</span>
                </button>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="flex items-center gap-4 rounded-full border border-outline-variant bg-surface/90 px-4 py-2 text-body-sm shadow-sm backdrop-blur">
                  <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-error" /> Urgent</div>
                  <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-tertiary" /> Active</div>
                  <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-secondary" /> Resolved</div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xxl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
              <div className="flex items-center justify-between border-b border-outline-variant p-stack_lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Reports</h3>
                <select className="rounded-lg border border-outline-variant bg-surface px-3 py-1 text-label-sm text-on-surface">
                  <option>Most Recent</option>
                  <option>Highest Severity</option>
                  <option>Closest</option>
                </select>
              </div>

              <div className="divide-y divide-outline-variant">
                {REPORTS.map((report) => (
                  <div key={report.id} className="cursor-pointer p-stack_lg transition-colors hover:bg-surface-container-low">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                        <img src={report.image} alt={report.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${report.statusClass}`}>
                              {report.status}
                            </span>
                            <h4 className="font-label-md text-label-md text-on-surface">{report.title}</h4>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{report.time}</span>
                        </div>
                        <p className="mb-3 font-body-sm text-body-sm text-on-surface-variant">{report.description}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-on-surface-variant">
                            <span className="flex items-center gap-1 text-[12px]">
                              <span className="material-symbols-outlined text-[16px]">location_on</span>
                              {report.location}
                            </span>
                            <span className="flex items-center gap-1 text-[12px]">
                              <span className="material-symbols-outlined text-[16px]">account_circle</span>
                              {report.author}
                            </span>
                          </div>
                          <button type="button" className="font-bold text-[12px] text-primary">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" className="w-full py-4 font-bold text-primary transition-all hover:bg-surface-container-low">
                View All Reports
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="overflow-hidden rounded-xxl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
              <div className="border-b border-outline-variant bg-surface-container-low p-stack_lg">
                <div className="mb-4 flex items-start justify-between gap-2">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Report Details</h3>
                  <button type="button" className="rounded-full p-1 transition-colors hover:bg-surface-container-high">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary p-0.5">
                    <img
                      className="h-full w-full rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP0Uqw6QtUBTC1BFllbYzjtG11qfHeJ54nzDcXELSwHdYdrx_kUBujrd3tgJzmdNdtYIJd1i6tNohu96rYRYOjCSCZl4AIdLFeRMyFW4cjC6oyoetDDfdCIUQUce0_41JMYfPmEUBw5CclLntT4CGGyb2GnVFiMC8psxnsQJlGSPsbNpQvMsULqTX-pMIdtEEjYNhVE0Uct-KkiqZ1L5HW-vGOUEUukg4mY3LGMf8pkgiiSMw7cK229g"
                      alt="Reporter avatar"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Rajesh Kumar</p>
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                      Verified Local Citizen
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-stack_lg">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Severity &amp; Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-error px-3 py-1 text-[10px] font-bold text-on-primary">
                      HIGH SEVERITY
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface">Active</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    GPS Location
                  </p>
                  <p className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                    12.9654° N, 80.2461° E
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Status Timeline
                  </p>
                  <div className="relative space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20" />
                      <p className="text-[11px] font-bold text-on-surface">Reported</p>
                      <p className="text-[10px] text-on-surface-variant">Today, 10:45 AM</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-outline-variant bg-surface" />
                      <p className="text-[11px] font-bold text-on-surface-variant">Assigned to Zone 13 Maintenance</p>
                      <p className="text-[10px] text-on-surface-variant">Pending...</p>
                    </div>
                  </div>
                </div>

                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-3 font-label-md text-label-md text-on-primary-container transition-all hover:bg-primary">
                  <span className="material-symbols-outlined">send</span>
                  Dispatch Quick Response Team
                </button>
              </div>
            </div>

            <div className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_lg shadow-ambient">
              <h3 className="mb-5 font-headline-sm text-headline-sm text-on-surface">Trending Concerns</h3>
              <div className="space-y-4">
                {[
                  ["Flooding", "42%", "42%", "bg-primary"],
                  ["Trash Accumulation", "28%", "28%", "bg-primary/70"],
                  ["Water Leaks", "15%", "15%", "bg-primary/50"],
                  ["Illegal Tree Cutting", "10%", "10%", "bg-primary/30"],
                  ["Noise Pollution", "5%", "5%", "bg-primary/20"],
                ].map(([label, value, width, color]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-body-sm text-on-surface">
                      <span>{label}</span>
                      <span className="font-bold">{value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className={`h-full ${color}`} style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_lg shadow-ambient">
              <h3 className="mb-5 font-headline-sm text-headline-sm text-on-surface">Status Distribution</h3>
              <div className="relative mx-auto mb-5 h-40 w-40">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#dbe1ff" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#004ac6" strokeDasharray="75 100" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#996100" strokeDasharray="15 100" strokeDashoffset="-75" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#ba1a1a" strokeDasharray="10 100" strokeDashoffset="-90" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-sm text-headline-sm text-on-surface">2.8k</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Reports</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface">
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Resolved</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-tertiary" /> In Progress</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-error" /> New</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary-container" /> Closed</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_lg shadow-ambient">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Participation Leaderboard by Zone</h3>
            <button type="button" className="font-bold text-primary">
              View Analytics
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Zone Name</th>
                  <th className="px-6 py-4 text-center">Reports Filed</th>
                  <th className="px-6 py-4 text-center">Resolution Rate</th>
                  <th className="px-6 py-4 text-center">Engagement Score</th>
                  <th className="px-6 py-4 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {LEADERBOARD.map((item) => (
                  <tr key={item.zone} className="hover:bg-surface-container-low">
                    <td className="px-6 py-4 font-bold text-primary">{item.rank}</td>
                    <td className="px-6 py-4 font-label-md text-label-md text-on-surface">{item.zone}</td>
                    <td className="px-6 py-4 text-center">{item.reports}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-[12px] font-bold text-secondary">
                        {item.resolution}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mx-auto h-2 w-32 overflow-hidden rounded-full bg-surface-container-high">
                        <div className="h-full rounded-full bg-primary" style={{ width: item.score }} />
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right ${item.trendColor}`}>
                      <span className="material-symbols-outlined">{item.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
