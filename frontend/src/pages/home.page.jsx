import AnimationWrapper from "../common/page-animation";

const HomePage = () => {
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* blog terbaru */}
        <div className="w-full ">
          <InPageNavigation></InPageNavigation>
        </div>

        {/* filter dan trending blog */}
        <div className=""></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
