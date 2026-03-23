"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("account-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("account-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return sessionStorage.getItem("northpath_account");
}

function getServerSnapshot() {
  return null;
}

export function useSelectedAccount() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
