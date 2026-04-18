import { useParams } from "react-router-dom";
import { publicAPI } from "../lib/api.js";
import useDetailData from "../hooks/useDetailData.js";
import DetailPage from "../components/DetailPage.jsx";
import ResearchBlocks from "../components/ResearchBlocks.jsx";
import { firstNonEmpty, getPrimitiveDetails } from "../utils/detailFields.js";
import { useDepartment } from "../../department/DepartmentContext";

export default function ResearchDetail() {
  const { id } = useParams();
  const { deptPath } = useDepartment();
  const { item, loading, error } = useDetailData(publicAPI.getResearchById, id);
  const title = item?.title || "Research";

  return (
    <DetailPage
      item={item}
      loading={loading}
      error={error}
      backTo={deptPath("/research")}
      backLabel="Back to Research"
      entityName="Research"
      title={title}
      badge={item?.category || "Research"}
      subtitle={item?.description || ""}
      image={firstNonEmpty(item?.image_path)}
      imageAlt={title}
      meta={[
        { label: "Category", value: item?.category || "-" },
        { label: "Link", value: item?.link ? "Available" : "-" },
      ]}
      additionalFields={getPrimitiveDetails(item, [
        "title",
        "description",
        "category",
        "image_path",
        "content_json",
      ])}
    >
      {item?.content_json && <ResearchBlocks blocks={item.content_json} />}
      {item?.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg bg-[#A6192E] px-4 py-2 text-sm font-semibold text-white"
        >
          Open link
        </a>
      )}
    </DetailPage>
  );
}
