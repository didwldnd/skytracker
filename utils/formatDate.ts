export const formatKoreanDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};
