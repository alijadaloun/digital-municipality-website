import React, { useMemo } from 'react';
import { MapPinned, Phone, Mail, Clock, MapPin } from 'lucide-react';

const BYBLOS = {
  // Byblos / Jbeil center and a tight bounding box for the module.
  center: { lat: 34.123, lng: 35.651 },
  bbox: { left: 35.60, bottom: 34.07, right: 35.70, top: 34.17 },
};

export default function Transit() {
  const mapSrc = useMemo(() => {
    const { left, bottom, right, top } = BYBLOS.bbox;
    // OpenStreetMap embed with Byblos bounding box.
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${BYBLOS.center.lat}%2C${BYBLOS.center.lng}`;
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Visit Us</h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Find the municipality location in Byblos/Jbeil and contact us for assistance.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MapPinned size={18} className="text-blue-600" />
              Map
            </div>
            <a
              className="text-xs font-bold text-blue-600 hover:underline"
              href={`https://www.openstreetmap.org/#map=14/${BYBLOS.center.lat}/${BYBLOS.center.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Open full map
            </a>
          </div>
          <iframe title="Byblos map" src={mapSrc} className="w-full h-[520px]" />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">Contact information</div>
            <div className="p-6 space-y-5">
              <InfoRow icon={<MapPin size={18} className="text-blue-600" />} label="Address" value="Byblos Municipality, Jbeil Main Street, Lebanon (Mock)" />
              <InfoRow icon={<Phone size={18} className="text-blue-600" />} label="Phone" value="+961 9 123 456 (Mock)" />
              <InfoRow icon={<Mail size={18} className="text-blue-600" />} label="Email" value="support@byblos-municipality.gov (Mock)" />
              <InfoRow icon={<Clock size={18} className="text-blue-600" />} label="Working hours" value="Mon–Fri, 8:00 AM – 3:00 PM (Mock)" />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">Location</div>
            <div className="p-6">
              <p className="text-sm text-slate-700 leading-relaxed">
                Use the map to get directions. For urgent issues, call the number above.
              </p>
              <a
                className="inline-block mt-4 text-xs font-bold text-blue-600 hover:underline"
                href={`https://www.openstreetmap.org/#map=16/${BYBLOS.center.lat}/${BYBLOS.center.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Open directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 p-2 rounded-xl bg-slate-50 border border-slate-100">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

