import Page from "../../../Page";
import { getRandomAPI } from "../../../publicApis";
import { withISRtoSSRWrapper } from "../../../utils/getISRSize";

export default Page;

export const getServerSideProps = withISRtoSSRWrapper({
  getProps: async (context) => {
    const data = await getRandomAPI();

    return {
      props: { data },
    };
  },
  isStatic: false,
  handleLimit: () => {
    console.log("Limit reached, redirecting to SSR page");
  },
  handleNotLimit: () => {
    console.log("Limit not reached, redirecting to ISR page");
  },
  destination: (slug) => `/${slug}-static`,
  thresholdKB: 4,
  timeoutMS: 10000
});
