import { useEffect, useState } from "react"
import { Food } from "./columns"
import { apiFetch } from "@/app/lib/api";

function useFoods() {
    const [data, setData ] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/foods", { method: "GET" })
            .then((res) => res.json())
            .then((data) => setData(data.foods))
            .catch((err) => console.error("Failed to fetch foods:", err))
            .finally(() => setLoading(false))
    }, [])

    console.log(data)
  return { data, loading }
}

export default useFoods