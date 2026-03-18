export type OnDataSourceError = (info: {
  operation: "save" | "find" | "flush" | "dispose";
  datasourceName: string;
  reason: any;
}) => void;
