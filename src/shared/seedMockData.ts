import mockSurveys from "./mockSurveys";

const LOCAL_KEY = "local_surveys";

export function seedLocalSurveys() {
  try {
    const existing = localStorage.getItem(LOCAL_KEY);
    if (!existing || existing === "[]") {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(mockSurveys));
      // eslint-disable-next-line no-console
      console.info("Seeded local_surveys with mock data");
    }
  } catch (err) {
    // ignore
  }
}

export default seedLocalSurveys;
