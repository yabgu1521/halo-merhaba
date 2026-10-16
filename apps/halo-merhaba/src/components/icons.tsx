const paths: Record<string, string> = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  file: "M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8M8 16h7",
  language:
    "M3 5h12M9 2v3m4 0c-1 7-5 10-10 12m2-9c2 4 5 7 9 9m0 5 5-13 5 13m-8-4h6",
  rings: "M10 17a6 6 0 1 0-5-10m9 0a6 6 0 1 0 5 10M8 3l4-2 4 2-4 5-4-5Z",
  chat: "M21 11a9 9 0 0 1-9 9H5l-3 2 1-7a9 9 0 1 1 18-4Z",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-16-3 7-7 3 3-7 7-3Z",
  book: "M12 5C8 2 4 2 2 3v17c4-1 7 0 10 2 3-2 6-3 10-2V3c-2-1-6-1-10 2Zm0 0v17",
  check: "m5 12 4 4L19 5",
  shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm-4 10 3 3 5-6",
  globe:
    "M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  instagram:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6-2h.01",
  search: "m21 21-5-5M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z",
  chevron: "m7 10 5 5 5-5",
  mail: "M2 4h20v16H2V4Zm0 0 10 9L22 4",
  lock: "M5 10h14v12H5V10Zm3 0V6a4 4 0 0 1 8 0v4",
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.compass} />
    </svg>
  );
}
