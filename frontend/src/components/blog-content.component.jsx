// komponent untuk menampilkan gambar
const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} />
      {caption.length ? (
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

// komponent untuk menampilkan quote
const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-twitter/10 p-3 pl-5 border-l-4 border-twitter">
      <p className="text-xl leading-10 md:text-2xl">{quote}</p>
      {caption.length ? (
        <p className="w-full text-twitter text-base">{caption}</p>
      ) : (
        ""
      )}
    </div>
  );
};

// komponent untuk menampilkan list
const List = ({ style, items }) => {
  return (
    <ol
      className={`pl-5 ${style === "ordered" ? " list-decimal" : " list-disc"}`}
    >
      {items.map((item, index) => {
        return (
          <li
            key={index}
            className="my-4"
            dangerouslySetInnerHTML={{ __html: item }}
          ></li>
        );
      })}
    </ol>
  );
};

const BlogContentComponent = ({ block }) => {
  let { type, data } = block;

  //   validasi paragraf
  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }

  //   validasi header h2 dan h3
  if (type === "header") {
    if (data.level === 3) {
      return (
        <h3
          dangerouslySetInnerHTML={{ __html: data.text }}
          className="text-3xl font-bold"
        ></h3>
      );
    }

    return (
      <h2
        dangerouslySetInnerHTML={{ __html: data.text }}
        className="text-4xl font-bold"
      ></h2>
    );
  }

  //   validasi gambar
  if (type === "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }

  //   validasi quote
  if (type === "quote") {
    return <Quote quote={data.text} caption={data.caption} />;
  }

  //   validasi list
  if (type === "list") {
    return <List style={data.style} items={data.items} />;
  }
};

export default BlogContentComponent;
