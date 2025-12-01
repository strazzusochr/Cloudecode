import * as THREE from 'three';

/**
 * Creates a highly detailed farmer character model (optimized high-poly)
 */
export function createDetailedFarmer(): THREE.Group {
  const group = new THREE.Group();

  // Body (torso) - Blue shirt - All Y positions adjusted so feet are at y=0
  const torsoGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 32, 16);
  const torsoMaterial = new THREE.MeshStandardMaterial({
    color: 0x4A6FA5,
    roughness: 0.7,
    metalness: 0.1,
  });
  const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
  torso.position.y = 1.5; // Adjusted +0.3
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  // Overalls (brown)
  const overallsGeometry = new THREE.BoxGeometry(0.7, 0.8, 0.5, 12, 12, 12);
  const overallsMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.8,
    metalness: 0.0,
  });
  const overalls = new THREE.Mesh(overallsGeometry, overallsMaterial);
  overalls.position.y = 0.9; // Adjusted +0.3
  overalls.castShadow = true;
  overalls.receiveShadow = true;
  group.add(overalls);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFDBAC,
    roughness: 0.6,
    metalness: 0.0,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 2.15; // Adjusted +0.3
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);

  // Mustache
  const mustacheGeometry = new THREE.TorusGeometry(0.12, 0.03, 16, 32, Math.PI);
  const mustacheMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 1.0,
  });
  const mustache = new THREE.Mesh(mustacheGeometry, mustacheMaterial);
  mustache.position.set(0, 2.05, 0.22); // Adjusted +0.3
  mustache.rotation.x = Math.PI / 2;
  mustache.castShadow = true;
  group.add(mustache);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.3,
  });

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.08, 2.2, 0.22); // Adjusted +0.3
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.08, 2.2, 0.22); // Adjusted +0.3
  group.add(rightEye);

  // Eye highlights
  const highlightGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

  const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
  leftHighlight.position.set(-0.075, 2.22, 0.24); // Adjusted +0.3
  group.add(leftHighlight);

  const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
  rightHighlight.position.set(0.085, 2.22, 0.24); // Adjusted +0.3
  group.add(rightHighlight);

  // Nose
  const noseGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const nose = new THREE.Mesh(noseGeometry, headMaterial);
  nose.position.set(0, 2.1, 0.25); // Adjusted +0.3
  nose.castShadow = true;
  group.add(nose);

  // Mouth (smile)
  const mouthGeometry = new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI);
  const mouthMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.8,
  });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0, 2.0, 0.22); // Adjusted +0.3
  mouth.rotation.x = Math.PI / 2;
  mouth.rotation.z = Math.PI;
  group.add(mouth);

  // Hat (straw hat)
  const hatBrimGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 32);
  const hatMaterial = new THREE.MeshStandardMaterial({
    color: 0xD4A574,
    roughness: 0.9,
    metalness: 0.0,
  });
  const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
  hatBrim.position.y = 2.4; // Adjusted +0.3
  hatBrim.castShadow = true;
  group.add(hatBrim);

  const hatTopGeometry = new THREE.CylinderGeometry(0.25, 0.28, 0.25, 32);
  const hatTop = new THREE.Mesh(hatTopGeometry, hatMaterial);
  hatTop.position.y = 2.55; // Adjusted +0.3
  hatTop.castShadow = true;
  group.add(hatTop);

  // Hat band
  const hatBandGeometry = new THREE.TorusGeometry(0.27, 0.02, 16, 32);
  const hatBandMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.7,
  });
  const hatBand = new THREE.Mesh(hatBandGeometry, hatBandMaterial);
  hatBand.position.y = 2.4; // Adjusted +0.3
  hatBand.rotation.x = Math.PI / 2;
  group.add(hatBand);

  // Red neckerchief
  const neckerchiefGeometry = new THREE.ConeGeometry(0.2, 0.3, 16);
  const neckerchiefMaterial = new THREE.MeshStandardMaterial({
    color: 0xDC143C,
    roughness: 0.5,
  });
  const neckerchief = new THREE.Mesh(neckerchiefGeometry, neckerchiefMaterial);
  neckerchief.position.set(0, 1.85, 0.15); // Adjusted +0.3
  neckerchief.rotation.x = Math.PI;
  neckerchief.castShadow = true;
  group.add(neckerchief);

  // Arms
  const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: 0x4A6FA5,
    roughness: 0.7,
  });

  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.45, 1.4, 0); // Adjusted +0.3
  leftArm.rotation.z = 0.3;
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.45, 1.4, 0); // Adjusted +0.3
  rightArm.rotation.z = -0.3;
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  group.add(rightArm);

  // Hands
  const handGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const handMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFDBAC,
    roughness: 0.6,
  });

  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-0.55, 1.05, 0); // Adjusted +0.3
  leftHand.castShadow = true;
  group.add(leftHand);

  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(0.55, 1.05, 0); // Adjusted +0.3
  rightHand.castShadow = true;
  group.add(rightHand);

  // Legs - adjusted so feet are at y=0
  const legGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 16);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.8,
  });

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, 0.3, 0); // Raised so bottom is at y=0
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, 0.3, 0); // Raised so bottom is at y=0
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  group.add(rightLeg);

  // Boots - adjusted to be at ground level (y=0)
  const bootGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.25, 8, 8, 8);
  const bootMaterial = new THREE.MeshStandardMaterial({
    color: 0x3D2817,
    roughness: 0.7,
  });

  const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  leftBoot.position.set(-0.15, 0.075, 0.05); // At ground level
  leftBoot.castShadow = true;
  group.add(leftBoot);

  const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  rightBoot.position.set(0.15, 0.075, 0.05); // At ground level
  rightBoot.castShadow = true;
  group.add(rightBoot);

  return group;
}

/**
 * Creates a highly detailed wolf/dog character model
 */
export function createDetailedWolf(): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.25, 0.8, 16, 32);
  const furMaterial = new THREE.MeshStandardMaterial({
    color: 0x696969,
    roughness: 0.9,
    metalness: 0.0,
  });
  const body = new THREE.Mesh(bodyGeometry, furMaterial);
  body.rotation.z = Math.PI / 2;
  body.position.set(0, 0.35, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.22, 24, 24);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0x505050,
    roughness: 0.9,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0.5, 0.4, 0);
  head.scale.set(1, 1, 1.2);
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);

  // Snout
  const snoutGeometry = new THREE.CapsuleGeometry(0.08, 0.15, 12, 16);
  const snoutMaterial = new THREE.MeshStandardMaterial({
    color: 0x3D3D3D,
    roughness: 0.8,
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(0.68, 0.35, 0);
  snout.castShadow = true;
  group.add(snout);

  // Nose
  const noseGeometry = new THREE.SphereGeometry(0.05, 12, 12);
  const noseMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.4,
  });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0.78, 0.35, 0);
  nose.castShadow = true;
  group.add(nose);

  // Ears (pointed)
  const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 16);
  const ear1 = new THREE.Mesh(earGeometry, headMaterial);
  ear1.position.set(0.45, 0.58, -0.1);
  ear1.rotation.z = -0.2;
  ear1.castShadow = true;
  group.add(ear1);

  const ear2 = new THREE.Mesh(earGeometry, headMaterial);
  ear2.position.set(0.45, 0.58, 0.1);
  ear2.rotation.z = -0.2;
  ear2.castShadow = true;
  group.add(ear2);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.04, 12, 12);
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFF99,
    emissive: 0x333300,
    roughness: 0.3,
  });

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(0.58, 0.48, -0.12);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.58, 0.48, 0.12);
  group.add(rightEye);

  // Pupils
  const pupilGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  leftPupil.position.set(0.6, 0.48, -0.12);
  group.add(leftPupil);

  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  rightPupil.position.set(0.6, 0.48, 0.12);
  group.add(rightPupil);

  // Legs (4 legs)
  const legGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.35, 12);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x505050,
    roughness: 0.9,
  });

  const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontLeftLeg.position.set(0.3, 0.0, -0.15);
  frontLeftLeg.castShadow = true;
  group.add(frontLeftLeg);

  const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontRightLeg.position.set(0.3, 0.0, 0.15);
  frontRightLeg.castShadow = true;
  group.add(frontRightLeg);

  const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  backLeftLeg.position.set(-0.3, 0.0, -0.15);
  backLeftLeg.castShadow = true;
  group.add(backLeftLeg);

  const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  backRightLeg.position.set(-0.3, 0.0, 0.15);
  backRightLeg.castShadow = true;
  group.add(backRightLeg);

  // Paws
  const pawGeometry = new THREE.SphereGeometry(0.06, 12, 12);
  const pawMaterial = new THREE.MeshStandardMaterial({
    color: 0x3D3D3D,
    roughness: 0.8,
  });

  const frontLeftPaw = new THREE.Mesh(pawGeometry, pawMaterial);
  frontLeftPaw.position.set(0.3, -0.15, -0.15);
  frontLeftPaw.scale.set(1, 0.5, 1);
  frontLeftPaw.castShadow = true;
  group.add(frontLeftPaw);

  const frontRightPaw = new THREE.Mesh(pawGeometry, pawMaterial);
  frontRightPaw.position.set(0.3, -0.15, 0.15);
  frontRightPaw.scale.set(1, 0.5, 1);
  frontRightPaw.castShadow = true;
  group.add(frontRightPaw);

  const backLeftPaw = new THREE.Mesh(pawGeometry, pawMaterial);
  backLeftPaw.position.set(-0.3, -0.15, -0.15);
  backLeftPaw.scale.set(1, 0.5, 1);
  backLeftPaw.castShadow = true;
  group.add(backLeftPaw);

  const backRightPaw = new THREE.Mesh(pawGeometry, pawMaterial);
  backRightPaw.position.set(-0.3, -0.15, 0.15);
  backRightPaw.scale.set(1, 0.5, 1);
  backRightPaw.castShadow = true;
  group.add(backRightPaw);

  // Tail
  const tailGeometry = new THREE.CapsuleGeometry(0.06, 0.4, 12, 16);
  const tail = new THREE.Mesh(tailGeometry, furMaterial);
  tail.position.set(-0.55, 0.4, 0);
  tail.rotation.z = Math.PI / 4;
  tail.castShadow = true;
  group.add(tail);

  // White chest patch
  const chestGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const chestMaterial = new THREE.MeshStandardMaterial({
    color: 0xE0E0E0,
    roughness: 1.0,
  });
  const chest = new THREE.Mesh(chestGeometry, chestMaterial);
  chest.position.set(0.2, 0.25, 0);
  chest.scale.set(0.8, 1, 0.6);
  group.add(chest);

  return group;
}

/**
 * Creates a highly detailed sheep character model with fluffy wool
 */
export function createDetailedSheep(): THREE.Group {
  const group = new THREE.Group();

  // Wool body (fluffy white)
  const woolMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFF0,
    roughness: 1.0,
    metalness: 0.0,
  });

  // Main wool body (large sphere)
  const bodyGeometry = new THREE.SphereGeometry(0.4, 24, 24);
  const body = new THREE.Mesh(bodyGeometry, woolMaterial);
  body.position.y = 0.4;
  body.scale.set(1, 0.9, 1.2);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Additional wool puffs for fluffiness
  const puffGeometry = new THREE.SphereGeometry(0.25, 16, 16);

  const puff1 = new THREE.Mesh(puffGeometry, woolMaterial);
  puff1.position.set(0.2, 0.5, 0.2);
  puff1.castShadow = true;
  group.add(puff1);

  const puff2 = new THREE.Mesh(puffGeometry, woolMaterial);
  puff2.position.set(-0.2, 0.5, 0.2);
  puff2.castShadow = true;
  group.add(puff2);

  const puff3 = new THREE.Mesh(puffGeometry, woolMaterial);
  puff3.position.set(0, 0.55, 0);
  puff3.scale.set(0.8, 0.8, 0.8);
  puff3.castShadow = true;
  group.add(puff3);

  // Black head
  const headGeometry = new THREE.SphereGeometry(0.18, 20, 20);
  const blackMaterial = new THREE.MeshStandardMaterial({
    color: 0x2C2C2C,
    roughness: 0.8,
  });
  const head = new THREE.Mesh(headGeometry, blackMaterial);
  head.position.set(0, 0.45, 0.45);
  head.scale.set(0.9, 1, 1.1);
  head.castShadow = true;
  group.add(head);

  // Ears
  const earGeometry = new THREE.CapsuleGeometry(0.05, 0.12, 8, 12);
  const ear1 = new THREE.Mesh(earGeometry, blackMaterial);
  ear1.position.set(-0.12, 0.52, 0.45);
  ear1.rotation.z = Math.PI / 6;
  ear1.castShadow = true;
  group.add(ear1);

  const ear2 = new THREE.Mesh(earGeometry, blackMaterial);
  ear2.position.set(0.12, 0.52, 0.45);
  ear2.rotation.z = -Math.PI / 6;
  ear2.castShadow = true;
  group.add(ear2);

  // Eyes (large, cute)
  const eyeWhiteGeometry = new THREE.SphereGeometry(0.06, 12, 12);
  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
  leftEyeWhite.position.set(-0.08, 0.48, 0.55);
  group.add(leftEyeWhite);

  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
  rightEyeWhite.position.set(0.08, 0.48, 0.55);
  group.add(rightEyeWhite);

  // Pupils
  const pupilGeometry = new THREE.SphereGeometry(0.03, 10, 10);
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  leftPupil.position.set(-0.08, 0.48, 0.57);
  group.add(leftPupil);

  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  rightPupil.position.set(0.08, 0.48, 0.57);
  group.add(rightPupil);

  // Nose
  const noseGeometry = new THREE.SphereGeometry(0.04, 12, 12);
  const nose = new THREE.Mesh(noseGeometry, blackMaterial);
  nose.position.set(0, 0.4, 0.6);
  nose.castShadow = true;
  group.add(nose);

  // Mouth (simple smile)
  const mouthGeometry = new THREE.TorusGeometry(0.05, 0.01, 8, 12, Math.PI);
  const mouth = new THREE.Mesh(mouthGeometry, blackMaterial);
  mouth.position.set(0, 0.35, 0.58);
  mouth.rotation.x = Math.PI / 2;
  mouth.rotation.z = Math.PI;
  group.add(mouth);

  // Black legs (4 legs)
  const legGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.35, 12);

  const frontLeftLeg = new THREE.Mesh(legGeometry, blackMaterial);
  frontLeftLeg.position.set(-0.15, 0.0, 0.15);
  frontLeftLeg.castShadow = true;
  group.add(frontLeftLeg);

  const frontRightLeg = new THREE.Mesh(legGeometry, blackMaterial);
  frontRightLeg.position.set(0.15, 0.0, 0.15);
  frontRightLeg.castShadow = true;
  group.add(frontRightLeg);

  const backLeftLeg = new THREE.Mesh(legGeometry, blackMaterial);
  backLeftLeg.position.set(-0.15, 0.0, -0.15);
  backLeftLeg.castShadow = true;
  group.add(backLeftLeg);

  const backRightLeg = new THREE.Mesh(legGeometry, blackMaterial);
  backRightLeg.position.set(0.15, 0.0, -0.15);
  backRightLeg.castShadow = true;
  group.add(backRightLeg);

  // Hooves
  const hoofGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.04, 12);
  const hoofMaterial = new THREE.MeshStandardMaterial({
    color: 0x1C1C1C,
    roughness: 0.7,
  });

  const frontLeftHoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
  frontLeftHoof.position.set(-0.15, -0.17, 0.15);
  frontLeftHoof.castShadow = true;
  group.add(frontLeftHoof);

  const frontRightHoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
  frontRightHoof.position.set(0.15, -0.17, 0.15);
  frontRightHoof.castShadow = true;
  group.add(frontRightHoof);

  const backLeftHoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
  backLeftHoof.position.set(-0.15, -0.17, -0.15);
  backLeftHoof.castShadow = true;
  group.add(backLeftHoof);

  const backRightHoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
  backRightHoof.position.set(0.15, -0.17, -0.15);
  backRightHoof.castShadow = true;
  group.add(backRightHoof);

  // Small wool tail
  const tailGeometry = new THREE.SphereGeometry(0.1, 12, 12);
  const tail = new THREE.Mesh(tailGeometry, woolMaterial);
  tail.position.set(0, 0.45, -0.45);
  tail.castShadow = true;
  group.add(tail);

  return group;
}

/**
 * Creates a detailed cabbage model with layered leaves
 */
export function createDetailedCabbage(): THREE.Group {
  const group = new THREE.Group();

  // Create multiple layers of cabbage leaves
  const cabbageColors = [0x90EE90, 0x7CFC00, 0x98FB98, 0x00FA9A];

  // Outer leaves (larger, darker green)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const leafGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: cabbageColors[0],
      roughness: 0.8,
      metalness: 0.0,
    });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

    const radius = 0.15;
    leaf.position.set(
      Math.cos(angle) * radius,
      0.1,
      Math.sin(angle) * radius
    );
    leaf.scale.set(0.8, 1, 1.2);
    leaf.rotation.y = angle;
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    group.add(leaf);
  }

  // Middle leaves
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.5;
    const leafGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: cabbageColors[1],
      roughness: 0.8,
    });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

    const radius = 0.1;
    leaf.position.set(
      Math.cos(angle) * radius,
      0.2,
      Math.sin(angle) * radius
    );
    leaf.scale.set(0.9, 1, 1.1);
    leaf.rotation.y = angle;
    leaf.castShadow = true;
    group.add(leaf);
  }

  // Inner core (lighter green)
  const coreGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: cabbageColors[2],
    roughness: 0.7,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.y = 0.25;
  core.castShadow = true;
  core.receiveShadow = true;
  group.add(core);

  // Add leaf veins (detail lines)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const veinGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
    const veinMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.9,
    });
    const vein = new THREE.Mesh(veinGeometry, veinMaterial);
    vein.position.set(
      Math.cos(angle) * 0.12,
      0.15,
      Math.sin(angle) * 0.12
    );
    vein.rotation.z = Math.PI / 2;
    vein.rotation.y = angle;
    group.add(vein);
  }

  // Bottom stem
  const stemGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.1, 12);
  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0xF5F5DC,
    roughness: 0.9,
  });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = -0.05;
  stem.castShadow = true;
  group.add(stem);

  return group;
}
