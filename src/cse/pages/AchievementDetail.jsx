import { useParams } from "react-router-dom";
import { publicAPI } from "../lib/api.js";
import useDetailData from "../hooks/useDetailData.js";
import DetailPage from "../components/DetailPage.jsx";
import { firstNonEmpty, getPrimitiveDetails } from "../utils/detailFields.js";
import { useDepartment } from "../../department/DepartmentContext";

export default function AchievementDetail() {
  const { id } = useParams();
  const { deptPath } = useDepartment();
  const { item, loading, error } = useDetailData(publicAPI.getAchievementById, id);
  const title = item?.title || "Achievement";
  const image = firstNonEmpty(item?.image_path, item?.banner_path);

  return (
    <DetailPage
      item={item}
      loading={loading}
      error={error}
      backTo={deptPath("/achievements")}
      backLabel="Back to Achievements"
      entityName="Achievement"
      title={title}
      badge="Achievement"
      subtitle={item?.description || ""}
      image={image}
      imageAlt={title}
      meta={[
        { label: "Category", value: item?.category || "-" },
        { label: "Published", value: item?.isPublished ? "Yes" : "No" },
      ]}
      additionalFields={getPrimitiveDetails(item, [
        "title",
        "description",
        "category",
        "image_path",
        "banner_path",
        "link",
        "isPublished",
      ])}
    >
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
