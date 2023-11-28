import React from "react";
import { db } from "../utils/firebase";
import { collection, query, getDocs, where, orderBy, limit } from "firebase/firestore";

const requestsRef = collection(db, "requests");

const Createions = () => {
  const [creations, setCreations] = React.useState(null);
  console.log(creations);
  React.useEffect(() => {
    const getCreations = async () => {
      const q = query(
        requestsRef,
        where("status", "==", "completed"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCreations(data);
    };
    getCreations();
  }, []);

  if (!Array.isArray(creations)) {
    return (
      <main className="container">
        <img
          className="d-block rotate-img w-25 vh-100 mx-auto"
          src="/kawwa-round.svg"
          alt="Kawwa"
          style={{
            marginTop: "-7%",
          }}
        />
      </main>
    );
  }

  return (
    <>
      {creations.map(({ processedVideo, brandName, id }, idx) => {
        return (
          <section className="video-sec" key={id}>
            <div>
              <h2>
                {brandName}
                <span className="colr-dot">.</span>
              </h2>
              <video
                height="500"
                className="fg-vid"
                autoPlay={idx === 0}
                loop
                muted
              >
                <source src={processedVideo} type="video/mp4" />
              </video>
              <div className="d-flex">
                <button className="sd-btn-sm">Download</button>
                <a href={`/Createion/${id}`} className="lnk">
                  View Details
                </a>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};

export default Createions;
