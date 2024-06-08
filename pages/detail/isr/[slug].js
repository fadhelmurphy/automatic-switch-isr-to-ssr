import Page from "../../../Page";
import { getRandomAPI } from "../../../publicApis";
import { withISRtoSSRWrapper } from "../../../utils/getISRSize";

export default Page;

export const getStaticPaths = async () => {
  console.log("execute static");
  return {
    paths: [], // indicates that no page needs to be created at build time
    fallback: "blocking", // indicates the type of fallback
  };
};

export const getStaticProps = withISRtoSSRWrapper({
  getProps: async (context) => {
    const data = await getRandomAPI();

    return {
      props: { data },
      revalidate: 30, 
    };
  },
  isStatic: true,
  handleLimit: () => {
    console.log("Limit reached, redirecting to SSR page");
    console.log("gedein storage nya cong!!");
  },
  destination: (slug) => `/${slug}-server`,
  thresholdKB: 4,
  timeoutMS: 10000
});
