export type Pose = {
  id: string;
  label: string;
  prompt: string;
  kittyMode?: string;
};

export const POSES: Pose[] = [
  {
    id: "stand-viewer",
    label: "Stand, face camera",
    prompt:
      "full body standing, feet on the same floor, looking at viewer, relaxed stance, arms at sides",
  },
  {
    id: "side-by-side",
    label: "Side by side",
    prompt:
      "full body standing side by side on the same floor, height comparison, looking at viewer",
  },
  {
    id: "three-quarter",
    label: "Three-quarter",
    prompt:
      "full body three-quarter view, looking back at viewer over the shoulder, feet on the floor",
  },
  {
    id: "sit",
    label: "Sit, feet down",
    prompt:
      "sitting on a low bench, feet on the floor, full body visible, looking at viewer",
  },
  {
    id: "lineup",
    label: "Height lineup",
    prompt:
      "standing in a straight lineup against a wall, full body, floor visible, same camera distance, looking at viewer",
  },
  {
    id: "porch",
    label: "Longhouse porch",
    prompt:
      "standing on a dark wooden longhouse porch at night, violet light in the rain, full body, floorboards visible, looking at viewer",
  },
  {
    id: "hands",
    label: "Holding hands",
    prompt:
      "standing together holding hands, full body, feet on the same floor, looking toward a bright light, scale readable in silhouette",
  },
  {
    id: "chair",
    label: "Kitty on chair",
    prompt:
      "tiny chaotic cybernetic android standing on the seat of an adult wooden chair, chair back taller than her head, full body, floor visible, looking at viewer",
    kittyMode: "personal",
  },
  {
    id: "palm",
    label: "Kitty in palm",
    prompt:
      "tiny chaotic cybernetic android standing in an adult open palm, whole body shorter than the forearm, head no larger than a knuckle, looking at viewer",
    kittyMode: "palm",
  },
  {
    id: "shin",
    label: "Kitty at shin",
    prompt:
      "tiny chaotic cybernetic android standing at a giant woman's shin, her head below mid-thigh, both full body, floor visible, looking at viewer",
    kittyMode: "amazon",
  },
  {
    id: "plate",
    label: "Kitty beside adult",
    prompt:
      "tiny chaotic cybernetic android standing next to an adult man as scale, both full body, feet on the same floor, 16 inch height difference obvious, looking at viewer",
    kittyMode: "sheet",
  },
  {
    id: "sheet",
    label: "Character sheet",
    prompt:
      "professional character reference sheet, one person, same face and same outfit in every panel: front full body, side full body, back full body, close-up face, even studio light, plain dark ground, labels under each view",
    kittyMode: "look",
  },
];

export function poseById(id: string): Pose {
  return POSES.find((p) => p.id === id) ?? POSES[0];
}
