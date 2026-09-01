import React, { useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

export default function WeatherPage() {
    useEffect(() => {
        const groups = Array.from(document.querySelectorAll(".group"));
        const handlers = groups.map((el) => {
            const onEnter = () => {
                el.querySelectorAll(".bg-primary\/10").forEach((n) => n.classList.replace("bg-primary/10", "bg-primary/30"));
            };
            const onLeave = () => {
                el.querySelectorAll(".bg-primary\/30").forEach((n) => n.classList.replace("bg-primary/30", "bg-primary/10"));
            };
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
            return { el, onEnter, onLeave };
        });

        return () => {
            handlers.forEach(({ el, onEnter, onLeave }) => {
                el.removeEventListener("mouseenter", onEnter);
                el.removeEventListener("mouseleave", onLeave);
            });
        };
    }, []);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-[40px] font-bold text-on-surface mb-2">Satellite-Based Weather Intelligence</h1>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">satellite_alt</span>
                        <span className="font-body-md text-body-md">Real-time Orbital Data & Multi-Regional Telemetry</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 border border-primary/20">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-label-md font-bold uppercase tracking-wider">Global Coverage Active</span>
                    </div>
                </div>
            </div>

            {/* Hero Weather Card */}
            <section>
                <div className="relative w-full min-h-[400px] rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.06)] bg-white border border-outline-variant/30 flex flex-col">
                    <div className="absolute inset-0 z-0 bg-slate-100">
                        <img
                            alt="Atmospheric View"
                            className="w-full h-full object-cover opacity-30"
                            data-alt="A generic atmospheric satellite view showing cloud formations over an ocean surface"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKG4gqax3qNrhnhlDmEsfxrts9AfMLNnLdvkfTVELQlOE3uiXoSRrTBIaEpNyZrlNmzg92mSSQwwFU-BvIwnJoBzP9GQCXgstasw_Os1UniZb20h9g_em67RcVUsaI0mfa3SsveIX9NmfbrTtsdYJyMVQ05DIb-8T9VjKhY4DuQQrrdM6MDo34EfKRNl3ckMowl_zjdJgKKlgY-A5uv8pXx91M66TaLnVztWF6L9fineKh-v9pqbxsNA"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
                    </div>
                    <div className="relative z-10 flex-grow flex flex-col justify-between p-stack_lg md:p-12">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        Live Satellite Feed
                                    </span>
                                    <h2 className="text-headline-md font-bold text-on-surface">Current Coordinates: 13.0827° N, 80.2707° E</h2>
                                </div>
                                <p className="text-on-surface-variant font-medium">Orbital Pass Timestamp: 2023-07-24T14:30:00Z</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-12 mt-12">
                            <div className="flex items-center gap-6">
                                <span className="material-symbols-outlined text-[100px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    partly_cloudy_day
                                </span>
                                <div>
                                    <div className="flex items-start">
                                        <span className="text-[84px] font-extrabold leading-none text-on-surface">31</span>
                                        <span className="text-[32px] font-bold mt-2 text-primary">°C</span>
                                    </div>
                                    <p className="text-headline-sm font-semibold text-on-surface-variant">Partly Cloudy</p>
                                </div>
                            </div>
                            <div className="flex gap-8 border-l border-outline-variant/30 pl-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Surface Temp</span>
                                    <span className="text-headline-sm font-bold text-on-surface">34°C</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Atmospheric Moisture</span>
                                    <span className="text-headline-sm font-bold text-on-surface">65%</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Wind Velocity</span>
                                    <span className="text-headline-sm font-bold text-on-surface">12 km/h</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Solar Radiation</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-headline-sm font-bold text-on-surface">8</span>
                                        <span className="bg-error/10 text-error text-[10px] font-bold px-1.5 py-0.5 rounded">High</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Remaining grids and content preserved, same structure and classes */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                {/* Weather Map Card */}
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 flex items-center justify-between border-b border-outline-variant/20">
                        <h3 className="font-bold text-headline-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">satellite</span>
                            Multi-Spectral Radar
                        </h3>
                        <div className="flex gap-1 bg-surface-container rounded-lg p-1">
                            <button className="bg-white shadow-sm text-primary text-[12px] font-bold px-3 py-1 rounded-md">Thermal</button>
                            <button className="text-on-surface-variant text-[12px] font-bold px-3 py-1 rounded-md hover:bg-white/50">Precip</button>
                            <button className="text-on-surface-variant text-[12px] font-bold px-3 py-1 rounded-md hover:bg-white/50">Vector</button>
                        </div>
                    </div>
                    <div className="relative flex-grow">
                        <div className="absolute inset-0 bg-slate-100">
                            <img
                                className="w-full h-full object-cover"
                                data-alt="A clean, high-resolution satellite map view featuring detailed coastal geography and urban layout. Overlaid on the map are translucent, aesthetic weather visualization layers showing temperature heatmaps in soft gradients of blue and orange."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq_NsuqMmNBIyKgzLMnTXeYtmH_LbAXn40gs4ODAW0auFSziZ_7WYPDxtojosq8E_CdTzmD31HIPWqA-yzcSr59yoXfE9cP5RYQaPXYLu0-ZLSmLm5V3vRN7AsziVfhT90bajfArlbHp-G9PxegJTz2AGGiur7-KiiCtZDKCWEWTqVoxbwTOQmZsBT-d6vmq_MzGbd3RS1JxLfr_dIntXTD3nVvoAHD5olRn3Pyne203FNbUGaI_frfg"
                            />
                        </div>
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                            <button className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-on-surface-variant">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                            <button className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-on-surface-variant">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                        </div>
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-md px-3 py-2 rounded-lg border border-outline-variant/30">
                            <p className="text-[10px] font-bold text-primary uppercase mb-1">Telemetry Opacity</p>
                            <div className="w-24 h-1 bg-primary/20 rounded-full overflow-hidden">
                                <div className="w-[60%] h-full bg-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                            {/* 24-Hour Forecast */}
                            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[500px]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-bold text-headline-sm">Orbital Projection: 24h</h3>
                                    <span className="text-primary font-semibold text-[14px] cursor-pointer hover:underline">View Model Data</span>
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <div className="flex-grow relative flex items-end gap-2 pb-6">
                                        <div className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                            <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">30°</span>
                                            <div className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" style={{ height: '70%' }} />
                                            <span className="text-[10px] text-on-surface-variant mt-3 font-medium">14:00</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                            <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">31°</span>
                                            <div className="w-full bg-primary rounded-t-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all" style={{ height: '75%' }} />
                                            <span className="text-[10px] text-primary mt-3 font-bold">15:00</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                            <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">30°</span>
                                            <div className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" style={{ height: '70%' }} />
                                            <span className="text-[10px] text-on-surface-variant mt-3 font-medium">16:00</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                            <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">29°</span>
                                            <div className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" style={{ height: '65%' }} />
                                            <span className="text-[10px] text-on-surface-variant mt-3 font-medium">17:00</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                            <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">28°</span>
                                            <div className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" style={{ height: '60%' }} />
                                            <span className="text-[10px] text-on-surface-variant mt-3 font-medium">18:00</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                            <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">27°</span>
                                            <div className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" style={{ height: '55%' }} />
                                            <span className="text-[10px] text-on-surface-variant mt-3 font-medium">19:00</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                            <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">26°</span>
                                            <div className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" style={{ height: '50%' }} />
                                            <span className="text-[10px] text-on-surface-variant mt-3 font-medium">20:00</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 px-2 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-secondary text-sm">water_drop</span>
                                            <span className="text-[12px] font-semibold text-on-surface">Precipitation Probability: 12%</span>
                                        </div>
                                        <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                            <div className="w-[12%] h-full bg-secondary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 7-Day Forecast */}
                            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[500px]">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-headline-sm">Extended Satellite Modeling</h3>
                                    <span className="material-symbols-outlined text-on-surface-variant/40">calendar_month</span>
                                </div>
                                <div className="flex flex-col gap-4 flex-grow">
                                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors cursor-default border border-transparent hover:border-outline-variant/20 flex-grow">
                                        <span className="w-12 font-bold text-on-surface">Mon</span>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>partly_cloudy_day</span>
                                            <span className="text-[14px] font-medium text-on-surface-variant/60">32° / 24°</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-secondary text-[20px]">water_drop</span>
                                                <span className="text-[14px] font-bold">10%</span>
                                            </div>
                                            <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                                                <div className="w-[80%] h-full bg-primary mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10 flex-grow">
                                        <span className="w-12 font-bold text-on-surface">Tue</span>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sunny</span>
                                            <span className="text-[14px] font-medium text-on-surface-variant/60">34° / 25°</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-on-surface-variant/40">
                                                <span className="material-symbols-outlined text-[20px]">water_drop</span>
                                                <span className="text-[14px] font-bold">5%</span>
                                            </div>
                                            <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                                                <div className="w-[90%] h-full bg-primary mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent flex-grow">
                                        <span className="w-12 font-bold text-on-surface">Wed</span>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloudy_snowing</span>
                                            <span className="text-[14px] font-medium text-on-surface-variant/60">29° / 23°</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-secondary">
                                                <span className="material-symbols-outlined text-[20px]">water_drop</span>
                                                <span className="text-[14px] font-bold">65%</span>
                                            </div>
                                            <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                                                <div className="w-[40%] h-full bg-primary mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent flex-grow">
                                        <span className="w-12 font-bold text-on-surface">Thu</span>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>rainy</span>
                                            <span className="text-[14px] font-medium text-on-surface-variant/60">28° / 22°</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-secondary">
                                                <span className="material-symbols-outlined text-[20px]">water_drop</span>
                                                <span className="text-[14px] font-bold">80%</span>
                                            </div>
                                            <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                                                <div className="w-[30%] h-full bg-primary mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                                <h3 className="font-bold text-headline-sm mb-6">Environmental Telemetry</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow">
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[20px]">air</span>
                                            <span className="text-label-sm uppercase">AQI (Satellite Est)</span>
                                        </div>
                                        <p className="text-headline-sm font-bold text-secondary">42 <span className="text-label-sm font-semibold opacity-60">Good</span></p>
                                    </div>
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
                                            <span className="text-label-sm uppercase">UV Index</span>
                                        </div>
                                        <p className="text-headline-sm font-bold text-error">8 <span className="text-label-sm font-semibold opacity-60">High</span></p>
                                    </div>
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[20px]">psychology</span>
                                            <span className="text-label-sm uppercase">Aerosol Optical Depth</span>
                                        </div>
                                        <p className="text-headline-sm font-bold text-on-surface">Low</p>
                                    </div>
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            <span className="text-label-sm uppercase">Atmospheric Vis</span>
                                        </div>
                                        <p className="text-headline-sm font-bold text-on-surface">10 km</p>
                                    </div>
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[20px]">thermostat</span>
                                            <span className="text-label-sm uppercase">Thermal Index</span>
                                        </div>
                                        <p className="text-headline-sm font-bold text-on-surface">36°C</p>
                                    </div>
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[20px]">opacity</span>
                                            <span className="text-label-sm uppercase">Dew Point</span>
                                        </div>
                                        <p className="text-headline-sm font-bold text-on-surface">22°C</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary border border-primary-container shadow-[0px_4px_20px_rgba(37,99,235,0.1)] rounded-[16px] p-6 text-white overflow-hidden relative flex flex-col min-h-[400px]">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <span className="material-symbols-outlined text-[200px]">auto_awesome</span>
                                </div>
                                <div className="relative z-10 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white">memory</span>
                                        </div>
                                        <h3 className="font-bold text-headline-sm">Orbital AI Insights</h3>
                                    </div>
                                    <div className="space-y-4 flex-grow flex flex-col justify-between">
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-start gap-4">
                                            <span className="material-symbols-outlined text-white/70 text-[24px]">info</span>
                                            <div>
                                                <p className="font-semibold text-body-md">Atmospheric Moisture Spike</p>
                                                <p className="text-white/70 text-body-sm mt-1">Satellite imagery indicates high moisture bands (approx 85%) moving into the sector after 6 PM today.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-start gap-4">
                                            <span className="material-symbols-outlined text-white/70 text-[24px]">check_circle</span>
                                            <div>
                                                <p className="font-semibold text-body-md">Clear Optical Window</p>
                                                <p className="text-white/70 text-body-sm mt-1">Low cloud cover probability (under 5%) for the next 4 hours. Optimal window for ground-based observation.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-start gap-4">
                                            <span className="material-symbols-outlined text-white/70 text-[24px]">warning</span>
                                            <div>
                                                <p className="font-semibold text-body-md">Solar Radiation Alert</p>
                                                <p className="text-white/70 text-body-sm mt-1">Ozone layer monitoring shows elevated UV transmission (Level 8) during 11 AM - 3 PM.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
                            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="font-bold text-headline-sm">Rainfall Analytics</h3>
                                        <p className="text-label-sm text-on-surface-variant/60">Satellite-Estimated Rainfall (mm)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-headline-md font-bold text-primary">124 mm</p>
                                        <p className="text-label-sm text-secondary font-bold">Satellite-Estimated Rainfall (mm)</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 mb-8 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-label-sm text-on-surface-variant/60 uppercase">Peak Intensity</span>
                                        <span className="text-body-md font-bold text-on-surface">18mm/h</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-label-sm text-on-surface-variant/60 uppercase">24h Total</span>
                                        <span className="text-body-md font-bold text-on-surface">42mm</span>
                                    </div>
                                </div>

                                <div className="flex-grow flex items-end gap-4 px-2">
                                    <div className="flex-1 flex flex-col justify-end h-full group relative">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">12mm</div>
                                        <div className="w-full bg-primary/40 rounded-t-md transition-all group-hover:bg-primary/60" style={{ height: '25%' }} />
                                        <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">Mon</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end h-full group relative">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">8mm</div>
                                        <div className="w-full bg-primary/40 rounded-t-md transition-all group-hover:bg-primary/60" style={{ height: '15%' }} />
                                        <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">Tue</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end h-full group relative">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">45mm</div>
                                        <div className="w-full bg-primary/80 rounded-t-md transition-all group-hover:bg-primary/90" style={{ height: '80%' }} />
                                        <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">Wed</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end h-full group relative">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">30mm</div>
                                        <div className="w-full bg-primary/60 rounded-t-md transition-all group-hover:bg-primary/70" style={{ height: '60%' }} />
                                        <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">Thu</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end h-full group relative">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">5mm</div>
                                        <div className="w-full bg-primary/40 rounded-t-md transition-all group-hover:bg-primary/60" style={{ height: '10%' }} />
                                        <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">Fri</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end h-full group relative">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">22mm</div>
                                        <div className="w-full bg-primary/40 rounded-t-md transition-all group-hover:bg-primary/60" style={{ height: '45%' }} />
                                        <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">Sat</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end h-full group relative">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">2mm</div>
                                        <div className="w-full bg-primary/40 rounded-t-md transition-all group-hover:bg-primary/60" style={{ height: '5%' }} />
                                        <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">Sun</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                                <h3 className="font-bold text-headline-sm mb-6">Vegetation Intelligence</h3>
                                <div className="grid grid-cols-2 md:grid-cols-1 gap-6 flex-grow">
                                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-3 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[24px]">eco</span>
                                            <span className="text-label-sm uppercase">NDVI</span>
                                        </div>
                                        <p className="text-[32px] font-bold text-secondary leading-none">0.68 <span className="text-label-sm font-semibold opacity-60 ml-2">Healthy</span></p>
                                    </div>
                                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-3 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[24px]">grass</span>
                                            <span className="text-label-sm uppercase">Biomass Density</span>
                                        </div>
                                        <p className="text-[32px] font-bold text-on-surface leading-none">4.2 <span className="text-label-sm font-semibold opacity-60 ml-2">kg/m²</span></p>
                                    </div>
                                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-3 text-on-surface-variant/70">
                                            <span className="material-symbols-outlined text-[24px]">water_drop</span>
                                            <span className="text-label-sm uppercase">Canopy Water</span>
                                        </div>
                                        <p className="text-[32px] font-bold text-on-surface leading-none">12%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                                <h3 className="font-bold text-headline-sm mb-8">Regional Anomaly Alerts</h3>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-error/10 text-error rounded-full text-[12px] font-bold">
                                        <span className="material-symbols-outlined text-[16px] animate-pulse">warning</span>
                                        2 Active Signatures
                                    </div>
                                </div>
                                <div className="space-y-6 flex-grow flex flex-col">
                                    <div className="flex items-start gap-4 p-5 bg-[#FFFBEC] border border-[#FFDC72] rounded-xl flex-grow">
                                        <div className="w-12 h-12 bg-[#FFDC72] rounded-lg flex items-center justify-center text-[#996100] shrink-0">
                                            <span className="material-symbols-outlined text-[24px]">thermostat_auto</span>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-on-surface text-[16px]">Thermal Anomaly Detected</h4>
                                                <span className="text-[12px] font-bold text-on-surface-variant/60">Expires in 4h</span>
                                            </div>
                                            <p className="text-body-md text-on-surface-variant/80">Thermal satellite radiometers indicate surface temperatures reaching 36°C with 75% relative humidity in monitored sector.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 bg-[#FFF4F2] border border-[#FFDAD6] rounded-xl flex-grow">
                                        <div className="w-12 h-12 bg-[#FFDAD6] rounded-lg flex items-center justify-center text-[#93000a] shrink-0">
                                            <span className="material-symbols-outlined text-[24px]">storm</span>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-on-surface text-[16px]">Convective Cell Formation</h4>
                                                <span className="text-[12px] font-bold text-on-surface-variant/60">Starts tomorrow 6 AM</span>
                                            </div>
                                            <p className="text-body-md text-on-surface-variant/80">Satellite radar detects increasing convective activity. Expect sustained precipitation up to 40mm.</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 mt-auto text-on-surface-variant font-bold text-[16px] border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors">View Complete Telemetry Logs</button>
                                </div>
                            </div>
                        </section>

                        <footer className="p-gutter border-t border-outline-variant/10 flex items-center justify-between text-on-surface-variant/40 max-w-[1600px] mx-auto w-full mt-auto py-8">
                            <p className="text-label-sm">© 2023 Satellite Weather Intelligence. All Rights Reserved.</p>
                            <div className="flex gap-6">
                                <a className="text-label-sm hover:text-primary transition-colors" href="#">System Status</a>
                                <a className="text-label-sm hover:text-primary transition-colors" href="#">API Docs</a>
                                <a className="text-label-sm hover:text-primary transition-colors" href="#">Telemetry Policy</a>
                            </div>
                                                </footer>
        </DashboardLayout>
    );
}