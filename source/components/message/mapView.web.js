export default ViewMap = ({ coordinates }) => {
  const [longitude, latitude] = coordinates;
  return (
    <img
      src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=400x400&markers=color:red%7C${latitude},${longitude}&key=AIzaSyBHNkM53-ynG2ryh_ruRVFpXK6q86KT6eA`}
      alt="Map with marker at ${latitude}, ${longitude}"
      width="100%"
      height="100%"
      style={{ border: 0 }}
    />
  );
}

