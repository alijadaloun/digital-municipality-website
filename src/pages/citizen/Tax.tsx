import React, { useMemo, useState } from 'react';
import { Receipt, Calculator, CheckCircle2 } from 'lucide-react';

type TaxHistoryItem = {
  id: string;
  createdAt: string;
  payload: TaxInputs;
  breakdown: TaxBreakdown;
  status: 'unpaid' | 'paid';
  paidAt?: string;
};

type TaxInputs = {
  ownerType: 'individual' | 'company';
  propertyType: 'apartment' | 'house' | 'land' | 'shop' | 'office';
  areaSqm: number;
  occupants: number;
  hasWater: boolean;
  hasElectricity: boolean;
  hasGarbage: boolean;
  estimatedKwh: number;
  estimatedWaterM3: number;
  parkingSpots: number;
  otherFees: number;
  deductibleExpenses: number;
};

type TaxBreakdown = {
  propertyFee: number;
  waterFee: number;
  electricityFee: number;
  garbageFee: number;
  parkingFee: number;
  otherFees: number;
  subtotal: number;
  deductibleExpenses: number;
  total: number;
};

const STORAGE_KEY = 'dms_tax_history_v1';

function money(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadHistory(): TaxHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items: TaxHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clampNum(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function calculate(inputs: TaxInputs): TaxBreakdown {
  // Simple municipal estimation formula (MVP): tweak as needed later.
  const propertyRatePerSqm =
    inputs.propertyType === 'land' ? 0.35 :
    inputs.propertyType === 'shop' ? 1.35 :
    inputs.propertyType === 'office' ? 1.15 :
    inputs.propertyType === 'house' ? 0.9 :
    0.75;

  const ownerMultiplier = inputs.ownerType === 'company' ? 1.15 : 1;

  const propertyFee = inputs.areaSqm * propertyRatePerSqm * ownerMultiplier;
  const waterFee = inputs.hasWater ? inputs.estimatedWaterM3 * 0.65 + inputs.occupants * 1.5 : 0;
  const electricityFee = inputs.hasElectricity ? inputs.estimatedKwh * 0.06 : 0;
  const garbageFee = inputs.hasGarbage ? 12 + inputs.occupants * 2.25 : 0;
  const parkingFee = inputs.parkingSpots * 8;
  const otherFees = inputs.otherFees;

  const subtotal = propertyFee + waterFee + electricityFee + garbageFee + parkingFee + otherFees;
  const deductibleExpenses = Math.min(inputs.deductibleExpenses, subtotal);
  const total = Math.max(0, subtotal - deductibleExpenses);

  return {
    propertyFee,
    waterFee,
    electricityFee,
    garbageFee,
    parkingFee,
    otherFees,
    subtotal,
    deductibleExpenses,
    total,
  };
}

export default function Tax() {
  const [inputs, setInputs] = useState<TaxInputs>({
    ownerType: 'individual',
    propertyType: 'apartment',
    areaSqm: 120,
    occupants: 3,
    hasWater: true,
    hasElectricity: true,
    hasGarbage: true,
    estimatedKwh: 250,
    estimatedWaterM3: 18,
    parkingSpots: 1,
    otherFees: 0,
    deductibleExpenses: 0,
  });

  const [history, setHistory] = useState<TaxHistoryItem[]>(() => loadHistory());

  const breakdown = useMemo(() => calculate(inputs), [inputs]);

  const addToHistory = () => {
    const item: TaxHistoryItem = {
      id: uid(),
      createdAt: new Date().toISOString(),
      payload: inputs,
      breakdown,
      status: 'unpaid',
    };
    const next = [item, ...history].slice(0, 50);
    setHistory(next);
    saveHistory(next);
  };

  const markPaid = (id: string) => {
    const next: TaxHistoryItem[] = history.map((h) =>
      h.id === id ? { ...h, status: 'paid' as const, paidAt: new Date().toISOString() } : h
    );
    setHistory(next);
    saveHistory(next);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Municipal Tax Calculator</h1>
          <p className="text-slate-500 font-medium tracking-tight">
            Enter property details and expenses to estimate dues for water, electricity, garbage, and property fees.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-6">
            <Calculator size={18} className="text-blue-600" />
            Inputs
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Owner Type">
              <select
                value={inputs.ownerType}
                onChange={(e) => setInputs({ ...inputs, ownerType: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </Field>

            <Field label="Property Type">
              <select
                value={inputs.propertyType}
                onChange={(e) => setInputs({ ...inputs, propertyType: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Land</option>
                <option value="shop">Shop</option>
                <option value="office">Office</option>
              </select>
            </Field>

            <Field label="Area (sqm)">
              <input
                type="number"
                min={0}
                value={inputs.areaSqm}
                onChange={(e) => setInputs({ ...inputs, areaSqm: clampNum(Number(e.target.value)) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>

            <Field label="Occupants">
              <input
                type="number"
                min={0}
                value={inputs.occupants}
                onChange={(e) => setInputs({ ...inputs, occupants: clampNum(Number(e.target.value)) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>

            <Toggle
              label="Include Water"
              checked={inputs.hasWater}
              onChange={(v) => setInputs({ ...inputs, hasWater: v })}
            />
            <Toggle
              label="Include Electricity"
              checked={inputs.hasElectricity}
              onChange={(v) => setInputs({ ...inputs, hasElectricity: v })}
            />
            <Toggle
              label="Include Garbage"
              checked={inputs.hasGarbage}
              onChange={(v) => setInputs({ ...inputs, hasGarbage: v })}
            />

            <Field label="Estimated kWh (monthly)">
              <input
                type="number"
                min={0}
                value={inputs.estimatedKwh}
                onChange={(e) => setInputs({ ...inputs, estimatedKwh: clampNum(Number(e.target.value)) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>

            <Field label="Estimated Water (m³ monthly)">
              <input
                type="number"
                min={0}
                value={inputs.estimatedWaterM3}
                onChange={(e) => setInputs({ ...inputs, estimatedWaterM3: clampNum(Number(e.target.value)) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>

            <Field label="Parking Spots">
              <input
                type="number"
                min={0}
                value={inputs.parkingSpots}
                onChange={(e) => setInputs({ ...inputs, parkingSpots: clampNum(Number(e.target.value)) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>

            <Field label="Other Municipality Fees">
              <input
                type="number"
                min={0}
                value={inputs.otherFees}
                onChange={(e) => setInputs({ ...inputs, otherFees: clampNum(Number(e.target.value)) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>

            <Field label="Applicable Expenses (deductible)">
              <input
                type="number"
                min={0}
                value={inputs.deductibleExpenses}
                onChange={(e) => setInputs({ ...inputs, deductibleExpenses: clampNum(Number(e.target.value)) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </Field>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={addToHistory}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
            >
              <Receipt size={16} />
              Save Estimate
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="text-slate-900 font-bold mb-6">Estimated Dues</div>
          <div className="space-y-3 text-sm">
            <Row label="Property fee" value={money(breakdown.propertyFee)} />
            <Row label="Water fee" value={money(breakdown.waterFee)} />
            <Row label="Electricity fee" value={money(breakdown.electricityFee)} />
            <Row label="Garbage fee" value={money(breakdown.garbageFee)} />
            <Row label="Parking fee" value={money(breakdown.parkingFee)} />
            <Row label="Other fees" value={money(breakdown.otherFees)} />
            <div className="pt-3 border-t border-slate-100" />
            <Row label="Subtotal" value={money(breakdown.subtotal)} strong />
            <Row label="Expenses" value={`- ${money(breakdown.deductibleExpenses)}`} />
            <Row label="Total due" value={money(breakdown.total)} strong />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Tax history</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Receipts & payment status</div>
          </div>
          <button onClick={clearHistory} className="text-xs font-bold text-slate-400 hover:text-slate-900">
            Clear
          </button>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No estimates saved yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {history.map((h) => (
              <div key={h.id} className="px-8 py-6 flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-900 truncate">Estimate #{h.id.slice(0, 8)}</p>
                    {h.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
                        <CheckCircle2 size={12} />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-wider">
                        Unpaid
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(h.createdAt).toLocaleString()} • {h.payload.propertyType} • {h.payload.areaSqm} sqm
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-3">Total: {money(h.breakdown.total)}</p>
                  {h.paidAt && <p className="text-xs text-slate-500 mt-1">Paid at: {new Date(h.paidAt).toLocaleString()}</p>}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {h.status !== 'paid' && (
                    <button
                      onClick={() => markPaid(h.id)}
                      className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800"
                    >
                      Mark as paid
                    </button>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="bg-white border border-slate-200 text-slate-700 text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-50"
                  >
                    Print receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-900 ml-1">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={checked
        ? 'flex items-center justify-between w-full px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold'
        : 'flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold'}
    >
      <span className="text-sm">{label}</span>
      <span className={checked ? 'text-[10px] uppercase tracking-widest' : 'text-[10px] uppercase tracking-widest text-slate-400'}>
        {checked ? 'On' : 'Off'}
      </span>
    </button>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? 'text-slate-900 font-bold' : 'text-slate-600 font-semibold'}>{label}</span>
      <span className={strong ? 'text-slate-900 font-bold' : 'text-slate-700 font-bold'}>{value}</span>
    </div>
  );
}

