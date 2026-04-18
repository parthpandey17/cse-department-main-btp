export default function ResearchBlocks({ blocks }) {
  const items = Array.isArray(blocks) ? blocks : [];

  return (
    <div className="space-y-4">
      {items.map((block, index) => (
        <div key={index} className="rounded-xl border bg-gray-50 p-4">
          {block.title && <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>}
          {block.content && <p className="mt-2 whitespace-pre-line text-gray-700">{block.content}</p>}
          {block.items && Array.isArray(block.items) && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{typeof item === "string" ? item : item?.label || item?.text}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
