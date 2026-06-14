import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

const geoUrlWorld = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// 30 rich unique colours
const STATE_COLORS = [
  "#22D3EE","#8B5CF6","#EC4899","#F43F5E","#14B8A6",
  "#0EA5E9","#06B6D4","#EAB308","#10B981","#3B82F6",
  "#06B6D4","#A855F7","#84CC16","#F59E0B","#22C55E",
  "#E11D48","#7C3AED","#0891B2","#D97706","#059669",
  "#06B6D4","#BE185D","#0D9488","#1D4ED8","#15803D",
  "#7E22CE","#B45309","#0369A1","#047857","#B91C1C",
];

const WorldMap = ({ customers }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [locData, setLocData] = useState({});
  const [stateColorMap, setStateColorMap] = useState({});

  useEffect(() => {
    const data = {};
    const colorMap = {};
    let colorIdx = 0;

    customers.forEach((c) => {
      const loc = c.country;
      if (!loc) return;
      if (!data[loc]) {
        data[loc] = { total: 0, female: 0, male: 0 };
        colorMap[loc] = STATE_COLORS[colorIdx % STATE_COLORS.length];
        colorIdx++;
      }
      data[loc].total += 1;
      if (c.gender === "Female") data[loc].female += 1;
      else data[loc].male += 1;
    });

    setLocData(data);
    setStateColorMap(colorMap);
  }, [customers]);

  const getLocKey = (geo) => {
    const geoName = geo.properties.name || "";
    if (locData[geoName]) return geoName;
    const keys = Object.keys(locData);
    return (
      keys.find(
        (k) =>
          k.toLowerCase() === geoName.toLowerCase() ||
          geoName.toLowerCase().includes(k.toLowerCase()) ||
          k.toLowerCase().includes(geoName.toLowerCase())
      ) || null
    );
  };

  const mapContent = React.useMemo(() => (
    <ComposableMap
      projectionConfig={{ scale: 140, center: [0, 20] }}
      style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}
    >
      <Geographies geography={geoUrlWorld}>
        {({ geographies }) =>
          geographies.map((geo, geoIndex) => {
            const locKey = getLocKey(geo);
            const stats = locData[locKey];
            const hasData = !!stats;
            const stateColor = stateColorMap[locKey] || STATE_COLORS[geoIndex % STATE_COLORS.length];
            const centroid = geoCentroid(geo);
            const stateName = geo.properties.name;

            // For some countries centroid calculation might fail, or be [NaN, NaN]
            const validCentroid = centroid && !isNaN(centroid[0]) && !isNaN(centroid[1]) ? centroid : null;

            const allCounts = Object.values(locData).map(d => d.total);
            const maxCount = Math.max(1, ...allCounts);
            const dotRadius = hasData ? Math.max(10, Math.min(24, 10 + (stats.total / maxCount) * 14)) : 0;

            return (
              <React.Fragment key={geo.rsmKey}>
                <Geography
                  geography={geo}
                  style={{
                    default: {
                      fill: hasData ? `${stateColor}28` : "var(--bg-card)",
                      stroke: hasData ? stateColor : "#9CA3AF",
                      strokeWidth: hasData ? 1.5 : 1,
                      outline: "none",
                      pointerEvents: "none",
                    },
                    hover: {
                      fill: `${stateColor}50`,
                      stroke: stateColor,
                      strokeWidth: 2.5,
                      outline: "none",
                      pointerEvents: "none",
                    },
                    pressed: { fill: `${stateColor}70`, outline: "none" },
                  }}
                />

                {hasData && validCentroid && (
                  <Marker coordinates={validCentroid}>
                    {/* Pulsing glow ring */}
                    <circle r={0} fill="transparent" stroke={stateColor} strokeWidth={1.5} opacity={0}>
                      <animate attributeName="r" values={`0;${dotRadius + 10}`} dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0" dur="2.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Split circle: left half = female (pink), right half = male (blue) */}
                    {stats.female > 0 && stats.male > 0 ? (
                      <>
                        <path
                          d={`M 0,${-dotRadius} A ${dotRadius},${dotRadius} 0 0,0 0,${dotRadius} Z`}
                          fill="#EC4899"
                        />
                        <path
                          d={`M 0,${-dotRadius} A ${dotRadius},${dotRadius} 0 0,1 0,${dotRadius} Z`}
                          fill="#3B82F6"
                        />
                      </>
                    ) : (
                      <circle
                        r={dotRadius}
                        fill={stats.female > 0 ? "#EC4899" : "#3B82F6"}
                      />
                    )}

                    <circle r={dotRadius} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />

                    <text
                      textAnchor="middle"
                      y={4}
                      style={{
                        fontSize: dotRadius > 14 ? 9 : 7,
                        fontWeight: 800,
                        fill: "#fff",
                        pointerEvents: "none",
                        fontFamily: "Inter, sans-serif",
                        textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                      }}
                    >
                      {stats.total}
                    </text>
                  </Marker>
                )}
              </React.Fragment>
            );
          })
        }
      </Geographies>
    </ComposableMap>
  ), [locData, stateColorMap]);

  return (
    <div
      className="xn-card"
      style={{ padding: "24px", position: "relative", overflow: "hidden" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg,#10B981,#3B82F6)", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
            World Customer Map
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
            {customers.length} customers across{" "}
            {Object.keys(locData).length} countries &nbsp;·&nbsp;
            <span style={{ color: "#EC4899", fontWeight: 700 }}>● Female</span>
            &nbsp;
            <span style={{ color: "#3B82F6", fontWeight: 700 }}>● Male</span>
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EC4899", display: "inline-block", boxShadow: "0 0 4px #EC4899" }} />
            Female customers
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", display: "inline-block", boxShadow: "0 0 4px #3B82F6" }} />
            Male customers
          </div>
        </div>
      </div>

      {/* Map container */}
      <div style={{
        width: "100%", height: 420, position: "relative", borderRadius: 16, overflow: "hidden",
        background: "var(--bg-body)", border: "1px solid var(--border-light)",
      }}>
        {/* Dot grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px", pointerEvents: "none", zIndex: 0,
        }} />

        {mapContent}

        {/* Tooltip */}
        {tooltipContent && (
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            background: "var(--bg-card)", backdropFilter: "blur(12px)",
            padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            color: "var(--text-main)", border: "1px solid var(--border-light)",
            pointerEvents: "none", whiteSpace: "nowrap",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 10,
          }}>
            {tooltipContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
