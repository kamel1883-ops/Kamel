/**
 * useVaultRecord — Hook لاسترجاع سجل حساس من الخزنة السعودية للعرض في الواجهة.
 *
 * إن وُجد الـ ref: يجلبه من الخزنة عبر vaultProxy ويعيد البيانات المفكوكة.
 * إن لم يوجد (وضع احتياطي / سجل قديم): يعيد null فيبقى العرض على البيانات المحلية في Base44.
 */
import { useState, useEffect } from "react";
import { readRecordFromVault } from "@/lib/vaultGeneric";

export function useVaultRecord(moduleKey, ref) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ref) { setData(null); return; }
    let on = true;
    setLoading(true);
    (async () => {
      const rec = await readRecordFromVault(moduleKey, ref);
      if (on) { setData(rec); setLoading(false); }
    })();
    return () => { on = false; };
  }, [moduleKey, ref]);

  return { data, loading };
}

/**
 * يدمج سجل Base44 مع بيانات الخزنة — يعيد الحقول الحساسة من الخزنة إن وُجدت،
 * وإلا يبقى على قيم Base44 (وضع احتياطي).
 */
export function mergeVaultRecord(baseRecord, vaultData, sensitiveKeys) {
  if (!vaultData) return baseRecord;
  const merged = { ...baseRecord };
  for (const k of sensitiveKeys) {
    if (vaultData[k] !== undefined && vaultData[k] !== null && vaultData[k] !== "") {
      merged[k] = vaultData[k];
    }
  }
  return merged;
}