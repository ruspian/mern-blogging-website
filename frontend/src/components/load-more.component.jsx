const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {
  if (state !== null && state.totalDocs > state.result.length) {
    return (
      <button
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
        onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1 })}
      >
        Muat Lebih Banyak!
      </button>
    );
  }
};

export default LoadMoreDataBtn;
