declare module '*.json' {
  const value: {
    abi: any[];
  };
  export default value;
}

interface Window {
  ethereum?: any;
}