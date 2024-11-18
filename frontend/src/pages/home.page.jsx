import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";

const HomePage = () => {
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* blog terbaru */}
        <div className="w-full ">
          <InPageNavigation
            routes={["home", "populer"]}
            defaultHidden={["populer"]}
          >
            <h1>ini blog terbaru</h1>
            <h1>ini blog populer</h1>
          </InPageNavigation>
        </div>

        {/* filter dan trending blog */}
        <div className=""></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
