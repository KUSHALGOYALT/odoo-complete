interface Skill {
  name: string;
  level: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  offeredSkills: Skill[];
  wantedSkills: Skill[];
}

// Skill level weights (higher level = higher weight)
const SKILL_LEVEL_WEIGHTS = {
  'BEGINNER': 1,
  'INTERMEDIATE': 2,
  'ADVANCED': 3,
  'EXPERT': 4
};

// Calculate skill compatibility score
const calculateSkillCompatibility = (skill1: Skill, skill2: Skill): number => {
  if (
    !skill1 ||
    !skill2 ||
    !skill1.name ||
    !skill2.name ||
    typeof skill1.name !== 'string' ||
    typeof skill2.name !== 'string'
  ) {
    return 0;
  }
  // Check if skills match
  if ((skill1.name || '').toLowerCase() !== (skill2.name || '').toLowerCase()) {
    return 0;
  }

  // Calculate level compatibility
  const level1 = SKILL_LEVEL_WEIGHTS[skill1.level as keyof typeof SKILL_LEVEL_WEIGHTS] || 1;
  const level2 = SKILL_LEVEL_WEIGHTS[skill2.level as keyof typeof SKILL_LEVEL_WEIGHTS] || 1;

  // Perfect match: same level
  if (level1 === level2) {
    return 1.0;
  }

  // Good match: one level difference
  if (Math.abs(level1 - level2) === 1) {
    return 0.8;
  }

  // Acceptable match: two level difference
  if (Math.abs(level1 - level2) === 2) {
    return 0.6;
  }

  // Poor match: three level difference
  if (Math.abs(level1 - level2) === 3) {
    return 0.3;
  }

  return 0.1; // Very poor match
};

// Calculate match percentage between two users
export const calculateMatchPercentage = (user1: User, user2: User): number => {
  if (!user1.offeredSkills || !user1.wantedSkills || !user2.offeredSkills || !user2.wantedSkills) {
    return 0;
  }

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Calculate how well user1's wanted skills match user2's offered skills
  user1.wantedSkills.forEach((wantedSkill) => {
    let bestMatch = 0;
    user2.offeredSkills.forEach((offeredSkill) => {
      const compatibility = calculateSkillCompatibility(wantedSkill, offeredSkill);
      bestMatch = Math.max(bestMatch, compatibility);
    });
    totalScore += bestMatch;
    maxPossibleScore += 1;
  });

  // Calculate how well user2's wanted skills match user1's offered skills
  user2.wantedSkills.forEach((wantedSkill) => {
    let bestMatch = 0;
    user1.offeredSkills.forEach((offeredSkill) => {
      const compatibility = calculateSkillCompatibility(wantedSkill, offeredSkill);
      bestMatch = Math.max(bestMatch, compatibility);
    });
    totalScore += bestMatch;
    maxPossibleScore += 1;
  });

  // Calculate percentage
  if (maxPossibleScore === 0) {
    return 0;
  }

  const matchPercentage = (totalScore / maxPossibleScore) * 100;
  
  // Add bonus for having more skills in common
  const commonSkills = user1.offeredSkills.filter(skill1 =>
    user2.wantedSkills.some(skill2 => 
      (typeof skill1?.name === 'string' && typeof skill2?.name === 'string' && skill1.name && skill2.name && skill1.name.toLowerCase() === skill2.name.toLowerCase())
    )
  ).length;

  const skillBonus = Math.min(commonSkills * 5, 20); // Max 20% bonus

  return Math.min(Math.round(matchPercentage + skillBonus), 100);
};

// Get detailed match breakdown
export const getMatchBreakdown = (user1: User, user2: User) => {
  const breakdown = {
    user1Wants: [] as Array<{wanted: Skill, bestMatch: Skill, score: number}>,
    user2Wants: [] as Array<{wanted: Skill, bestMatch: Skill, score: number}>,
    commonSkills: [] as Array<{skill: Skill, user1Level: string, user2Level: string}>,
    totalScore: 0,
    maxPossibleScore: 0
  };

  // User1's wanted skills matched with User2's offered skills
  user1.wantedSkills.forEach((wantedSkill) => {
    let bestMatch = null as Skill | null;
    let bestScore = 0;

    user2.offeredSkills.forEach((offeredSkill) => {
      const compatibility = calculateSkillCompatibility(wantedSkill, offeredSkill);
      if (compatibility > bestScore) {
        bestScore = compatibility;
        bestMatch = offeredSkill;
      }
    });

    if (bestMatch) {
      breakdown.user1Wants.push({
        wanted: wantedSkill,
        bestMatch: bestMatch,
        score: bestScore
      });
      breakdown.totalScore += bestScore;
    }
    breakdown.maxPossibleScore += 1;
  });

  // User2's wanted skills matched with User1's offered skills
  user2.wantedSkills.forEach((wantedSkill) => {
    let bestMatch = null as Skill | null;
    let bestScore = 0;

    user1.offeredSkills.forEach((offeredSkill) => {
      const compatibility = calculateSkillCompatibility(wantedSkill, offeredSkill);
      if (compatibility > bestScore) {
        bestScore = compatibility;
        bestMatch = offeredSkill;
      }
    });

    if (bestMatch) {
      breakdown.user2Wants.push({
        wanted: wantedSkill,
        bestMatch: bestMatch,
        score: bestScore
      });
      breakdown.totalScore += bestScore;
    }
    breakdown.maxPossibleScore += 1;
  });

  // Find common skills
  user1.offeredSkills.forEach((skill1) => {
    user2.wantedSkills.forEach((skill2) => {
      if (typeof skill1?.name === 'string' && typeof skill2?.name === 'string' && skill1.name && skill2.name && skill1.name.toLowerCase() === skill2.name.toLowerCase()) {
        breakdown.commonSkills.push({
          skill: skill1,
          user1Level: skill1.level,
          user2Level: skill2.level
        });
      }
    });
  });

  return breakdown;
};

// Get match description
export const getMatchDescription = (percentage: number): string => {
  if (percentage >= 90) return "Perfect Match!";
  if (percentage >= 80) return "Excellent Match";
  if (percentage >= 70) return "Great Match";
  if (percentage >= 60) return "Good Match";
  if (percentage >= 50) return "Fair Match";
  if (percentage >= 30) return "Poor Match";
  return "No Match";
};

// Get match color
export const getMatchColor = (percentage: number): string => {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-blue-600";
  if (percentage >= 40) return "text-yellow-600";
  return "text-red-600";
};

// Get match badge variant
export const getMatchBadgeVariant = (percentage: number): string => {
  if (percentage >= 80) return "bg-green-100 text-green-800";
  if (percentage >= 60) return "bg-blue-100 text-blue-800";
  if (percentage >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}; 