export default function distanceFormatter (distance) {
  return distance > 999 ? distance / 1000 + " km" : distance + " m";
}