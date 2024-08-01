import { useState, useEffect } from "react";
import { useRequest } from "./hooks/use-request";
import { fetcher } from "./api";

function App() {
  const [index, setIndex] = useState(0); // 可以动态改变这个索引
  const { data, loading, error, refresh } = useRequest(fetcher, {
    defaultParams: [index], // 将参数传递给 fetcher
    onSuccess: () => console.log("success"),
    onError: () => console.log("error"),
    // 数据未加载完时不渲染,显示Loading
    suspense: true, //
    // 数据缓存标记
    cacheKey: `fetcher-${index}`,
  });

  // useEffect(() => {
  //   refresh(); // 手动触发初始加载
  // }, [index]);

  if (loading) return "loading...";
  if (error) return `error:${error}`;
  return (
    <div>
      <button onClick={() => setIndex((prev) => (prev + 1) % 3)}>fetch data</button>
      {data ? <p>{JSON.stringify(data, null, 2)}</p> : null}
    </div>
  );
}

export default App;
