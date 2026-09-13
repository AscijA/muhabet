import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setConnectionState } from "src/store/chatSlice";

export const useNetworkStatus = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const update = () => dispatch(setConnectionState(navigator.onLine ? "online" : "offline"));
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, [dispatch]);
};
