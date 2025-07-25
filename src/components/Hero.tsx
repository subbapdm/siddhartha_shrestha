import Container from "./Container";

const Hero = () => {
  return (
    <div className="bg-blue-900 text-white py-5">
      <Container>
        <div className="w-full flex flex-col items-center py-5 text-center ">
          <h1 className="text-4xl font-bold mb-5">सिद्धार्थ श्रेष्ठ</h1>
          <h3 className="text-xl md:text-2xl font-medium mb-2">जापानवासी नेपालीहरूको लागि प्रतिबद्ध नेतृत्व</h3>
          <p className="text-[10px] md:text-[13px] font-medium">जुलाई २७ मा सिद्धार्थ श्रेष्ठलाई तपाईँको अमूल्य भोट दिएर विजय गराऔँ</p>
        </div>
      </Container>
    </div>
  );
};

export default Hero;
