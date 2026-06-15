import React, { Profiler, useState, useEffect } from "react";
import { onCLS, onLCP, onFCP, onTTFB } from "web-vitals";

const thresholds = {
  CLS: 0.1,
  FID: 100,
  LCP: 2500,
  FCP: 1800,
  TTFB: 200,
};

const getColor = (value, threshold) => {
  if (value <= threshold) return "#4CAF50";
  if (value <= threshold * 2) return "#FFC107";
  return "#F44336";
};

function VitalDisplay({ name, value, unit, threshold }) {
  const color = getColor(value, threshold);
  return (
    <div className="vital-card" style={{ borderLeft: `5px solid ${color}` }}>
      <span className="vital-name">{name}</span>
      <span className="vital-value" style={{ color }}>
        {value.toFixed(2)} {unit}
      </span>
    </div>
  );
}

const ChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
  </svg>
);

const StatsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M3 17h3v-7H3v7zm5 0h3v-10H8v10zm5 0h3v-4h-3v4zm5 0h3v-12h-3v12z" />
  </svg>
);

function Statistic() {
  const [metrics, setMetrics] = useState({
    CLS: 0,
    FID: 0,
    LCP: 0,
    FCP: 0,
    TTFB: 0,
  });

  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    onCLS(metric => setMetrics(prev => ({ ...prev, CLS: metric.value })));
    onLCP(metric => setMetrics(prev => ({ ...prev, LCP: metric.value })));
    onFCP(metric => setMetrics(prev => ({ ...prev, FCP: metric.value })));
    onTTFB(metric => setMetrics(prev => ({ ...prev, TTFB: metric.value })));
  }, []);

  return (
    <div className={`vitals-panel ${collapsed ? "collapsed" : ""}`}>
      <div className="vitals-header" onClick={() => setCollapsed(!collapsed)}>
        {!collapsed && <span>Web Vitals</span>}
        {collapsed ? <StatsIcon size={24} /> : <ChevronUp />}
      </div>
      {!collapsed && (
        <div className="vitals-body">
          <VitalDisplay
            name="Cumulative Layout Shift (CLS)"
            value={metrics.CLS}
            unit=""
            threshold={thresholds.CLS}
          />
          <VitalDisplay
            name="Largest Contentful Paint (LCP)"
            value={metrics.LCP}
            unit="ms"
            threshold={thresholds.LCP}
          />
          <VitalDisplay
            name="First Contentful Paint (FCP)"
            value={metrics.FCP}
            unit="ms"
            threshold={thresholds.FCP}
          />
          <VitalDisplay
            name="Time to First Byte (TTFB)"
            value={metrics.TTFB}
            unit="ms"
            threshold={thresholds.TTFB}
          />
        </div>
      )}
    </div>
  );
}

export default Statistic;
