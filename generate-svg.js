const fs = require('fs');
const geojson = JSON.parse(fs.readFileSync('./public/uttarakhand.geojson', 'utf8'));

const minLng = 77.5;
const maxLng = 81.1;
const minLat = 28.7;
const maxLat = 31.5;
const width = 800;
const height = 800;

function project(lng, lat) {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;
    return [x, y];
}

function processRings(rings) {
    return rings.map(ring => {
        return "M " + ring.map(coord => {
            const [x, y] = project(coord[0], coord[1]);
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(" L ") + " Z";
    }).join(" ");
}

const districtColors = {
    'Almora': 'fill-orange-400/20 stroke-orange-400/50 hover:fill-orange-400/60',
    'Bageshwar': 'fill-yellow-400/20 stroke-yellow-400/50 hover:fill-yellow-400/60',
    'Chamoli': 'fill-rose-400/20 stroke-rose-400/50 hover:fill-rose-400/60',
    'Champawat': 'fill-amber-400/20 stroke-amber-400/50 hover:fill-amber-400/60',
    'Dehradun': 'fill-indigo-500/20 stroke-indigo-500/50 hover:fill-indigo-500/60',
    'Hardwar': 'fill-teal-400/20 stroke-teal-400/50 hover:fill-teal-400/60',
    'Nainital': 'fill-blue-400/20 stroke-blue-400/50 hover:fill-blue-400/60',
    'Pauri Garhwal': 'fill-purple-400/20 stroke-purple-400/50 hover:fill-purple-400/60',
    'Pithoragarh': 'fill-pink-400/20 stroke-pink-400/50 hover:fill-pink-400/60',
    'Rudraprayag': 'fill-emerald-400/20 stroke-emerald-400/50 hover:fill-emerald-400/60',
    'Tehri Garhwal': 'fill-sky-400/20 stroke-sky-400/50 hover:fill-sky-400/60',
    'Udham Singh Nagar': 'fill-lime-400/20 stroke-lime-400/50 hover:fill-lime-400/60',
    'Uttarkashi': 'fill-red-400/20 stroke-red-400/50 hover:fill-red-400/60',
};

let paths = [];
let dehradunPinPos = { x: 110, y: 240 };

geojson.features.forEach(feature => {
    let d = "";
    if (feature.geometry.type === 'Polygon') {
        d = processRings(feature.geometry.coordinates);
    } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
            d += processRings(polygon) + " ";
        });
    }

    const name = feature.properties.Dist_Name || feature.properties.NAME_2 || feature.properties.district || 'Unknown';
    const colorClass = districtColors[name] || 'fill-primary/10 stroke-primary/30 hover:fill-primary/40 hover:stroke-primary';

    if (name === "Dehradun") {
        const ring = feature.geometry.type === 'Polygon' ? feature.geometry.coordinates[0] : feature.geometry.coordinates[0][0];
        let midLng = 0, midLat = 0;
        ring.forEach(c => { midLng += c[0]; midLat += c[1]; });
        const [x, y] = project(midLng / ring.length, midLat / ring.length);
        dehradunPinPos = { x, y };
    }
    
    paths.push(`
        <motion.path
          key="${name}"
          d="${d.trim()}"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01, strokeWidth: 2 }}
          className="${colorClass} transition-all duration-300 cursor-pointer"
          vectorEffect="non-scaling-stroke"
          onMouseEnter={() => setHovered(${JSON.stringify(name)})}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setSelected(${JSON.stringify(name)})}
        >
          <title>${name}</title>
        </motion.path>`);
});

const componentCodes = `"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function UttarakhandSVGMap({ className = "" }: { className?: string }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <div className={"w-full h-full relative " + className}>
      <div className="absolute top-0 right-0 p-4 z-20 pointer-events-none">
        <AnimatePresence>
            {(hovered || selected) && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-primary/20 p-4 rounded-2xl shadow-xl min-w-[150px]"
                >
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">District</p>
                    <p className="text-2xl font-black text-primary leading-none">{hovered || selected}</p>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <svg 
        viewBox="0 0 ${width} ${height}" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        <g className="map-paths">
            ${paths.join('')}
        </g>
        
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          style={{ pointerEvents: 'none' }}
        >
          <circle cx="${dehradunPinPos.x.toFixed(2)}" cy="${dehradunPinPos.y.toFixed(2)}" r="15" className="fill-indigo-500/20" />
          <circle cx="${dehradunPinPos.x.toFixed(2)}" cy="${dehradunPinPos.y.toFixed(2)}" r="6" className="fill-indigo-600 shadow-md ring-4 ring-white dark:ring-black" />
          <motion.circle 
            cx="${dehradunPinPos.x.toFixed(2)}" 
            cy="${dehradunPinPos.y.toFixed(2)}" 
            r="20" 
            className="stroke-indigo-400 stroke-1"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
          <foreignObject 
            x="${(dehradunPinPos.x - 12).toFixed(2)}" 
            y="${(dehradunPinPos.y - 40).toFixed(2)}" 
            width="24" 
            height="24"
          >
             <div className="flex justify-center items-center">
                <MapPin className="text-indigo-600 filter drop-shadow-sm" size={24} />
             </div>
          </foreignObject>
        </motion.g>
      </svg>
      
      <div className="absolute bottom-4 left-4 p-4 text-xs text-muted-foreground/60 max-w-[200px] pointer-events-none text-left">
          <p>Explore our special focus on native narratives across the 13 districts of Uttarakhand.</p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('./components/UttarakhandSVGMap.tsx', componentCodes);
console.log("SVG Map generated successfully at components/UttarakhandSVGMap.tsx!");
