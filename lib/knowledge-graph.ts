// ===================================
// AP KNOWLEDGE GRAPH
// College Board 공식 커리큘럼 기반
// ===================================

export interface Topic {
    id: string;
    code: string;
    name: string;
    nameKo?: string;
    parentId?: string;
    importance: 'core' | 'advanced' | 'optional';
    examWeight?: number; // % of AP exam
    dependencies?: string[]; // topic codes required before this topic
}

export interface Subject {
    id: string;
    code: string;
    name: string;
    topics: Topic[];
}

// ===================================
// AP CALCULUS AB
// College Board Units 1-8
// ===================================
export const AP_CALCULUS_AB: Subject = {
    id: 'ap-calc-ab',
    code: 'AP_CALC_AB',
    name: 'AP Calculus AB',
    topics: [
        // Unit 1: Limits and Continuity (10-12%)
        { id: 'calc-1', code: 'limits', name: 'Limits and Continuity', importance: 'core', examWeight: 11 },
        { id: 'calc-1-1', code: 'limits.intro', name: 'Introducing Calculus: Can Change Occur at an Instant?', parentId: 'calc-1', importance: 'core' },
        { id: 'calc-1-2', code: 'limits.definition', name: 'Defining Limits and Using Limit Notation', parentId: 'calc-1', importance: 'core', dependencies: ['limits.intro'] },
        { id: 'calc-1-3', code: 'limits.estimation', name: 'Estimating Limit Values from Graphs', parentId: 'calc-1', importance: 'core' },
        { id: 'calc-1-4', code: 'limits.tables', name: 'Estimating Limit Values from Tables', parentId: 'calc-1', importance: 'core' },
        { id: 'calc-1-5', code: 'limits.properties', name: 'Determining Limits Using Algebraic Properties', parentId: 'calc-1', importance: 'core' },
        { id: 'calc-1-6', code: 'limits.manipulation', name: 'Determining Limits Using Algebraic Manipulation', parentId: 'calc-1', importance: 'core' },
        { id: 'calc-1-7', code: 'limits.squeeze', name: 'Squeeze Theorem', parentId: 'calc-1', importance: 'advanced' },
        { id: 'calc-1-8', code: 'limits.continuity', name: 'Continuity', parentId: 'calc-1', importance: 'core' },
        { id: 'calc-1-9', code: 'limits.ivt', name: 'Intermediate Value Theorem (IVT)', parentId: 'calc-1', importance: 'core' },

        // Unit 2: Differentiation Definition (10-12%)
        { id: 'calc-2', code: 'diff-def', name: 'Differentiation: Definition and Fundamental Properties', importance: 'core', examWeight: 11 },
        { id: 'calc-2-1', code: 'diff.definition', name: 'Defining Average and Instantaneous Rates of Change', parentId: 'calc-2', importance: 'core' },
        { id: 'calc-2-2', code: 'diff.derivative-def', name: 'Defining the Derivative of a Function', parentId: 'calc-2', importance: 'core', dependencies: ['limits.definition', 'limits.continuity'] },
        { id: 'calc-2-3', code: 'diff.estimating', name: 'Estimating Derivatives of a Function at a Point', parentId: 'calc-2', importance: 'core' },
        { id: 'calc-2-4', code: 'diff.differentiability', name: 'Connecting Differentiability and Continuity', parentId: 'calc-2', importance: 'core' },
        { id: 'calc-2-5', code: 'diff.power-rule', name: 'Power Rule', parentId: 'calc-2', importance: 'core' },
        { id: 'calc-2-6', code: 'diff.sum-difference', name: 'Derivative Rules: Sum, Difference, Constant Multiple', parentId: 'calc-2', importance: 'core' },
        { id: 'calc-2-7', code: 'diff.trig', name: 'Derivatives of Trigonometric Functions', parentId: 'calc-2', importance: 'core' },
        { id: 'calc-2-8', code: 'diff.exp-log', name: 'Derivatives of eˣ and ln(x)', parentId: 'calc-2', importance: 'core' },

        // Unit 3: Differentiation Composite, Implicit, Inverse (9-13%)
        { id: 'calc-3', code: 'diff-advanced', name: 'Differentiation: Composite, Implicit, and Inverse Functions', importance: 'core', examWeight: 11 },
        { id: 'calc-3-1', code: 'diff.chain-rule', name: 'Chain Rule', parentId: 'calc-3', importance: 'core' },
        { id: 'calc-3-2', code: 'diff.implicit', name: 'Implicit Differentiation', parentId: 'calc-3', importance: 'core' },
        { id: 'calc-3-3', code: 'diff.inverse', name: 'Differentiating Inverse Functions', parentId: 'calc-3', importance: 'advanced' },
        { id: 'calc-3-4', code: 'diff.inverse-trig', name: 'Differentiating Inverse Trigonometric Functions', parentId: 'calc-3', importance: 'advanced' },
        { id: 'calc-3-5', code: 'diff.higher-order', name: 'Higher-Order Derivatives', parentId: 'calc-3', importance: 'core' },

        // Unit 4: Contextual Applications of Differentiation (10-15%)
        { id: 'calc-4', code: 'diff-context', name: 'Contextual Applications of Differentiation', importance: 'core', examWeight: 12 },
        { id: 'calc-4-1', code: 'app.motion', name: 'Interpreting Motion (Position, Velocity, Acceleration)', parentId: 'calc-4', importance: 'core' },
        { id: 'calc-4-2', code: 'app.related-rates', name: 'Related Rates', parentId: 'calc-4', importance: 'core' },
        { id: 'calc-4-3', code: 'app.linearization', name: 'Linearization and Tangent Line Approximation', parentId: 'calc-4', importance: 'advanced' },
        { id: 'calc-4-4', code: 'app.lhopital', name: "L'Hôpital's Rule", parentId: 'calc-4', importance: 'advanced' },

        // Unit 5: Analytical Applications of Differentiation (15-18%)
        { id: 'calc-5', code: 'diff-analytical', name: 'Analytical Applications of Differentiation', importance: 'core', examWeight: 17 },
        { id: 'calc-5-1', code: 'analysis.mvt', name: 'Mean Value Theorem', parentId: 'calc-5', importance: 'core' },
        { id: 'calc-5-2', code: 'analysis.evt', name: 'Extreme Value Theorem', parentId: 'calc-5', importance: 'core' },
        { id: 'calc-5-3', code: 'analysis.critical-points', name: 'Determining Intervals of Increase/Decrease', parentId: 'calc-5', importance: 'core' },
        { id: 'calc-5-4', code: 'analysis.first-derivative', name: 'First Derivative Test', parentId: 'calc-5', importance: 'core' },
        { id: 'calc-5-5', code: 'analysis.concavity', name: 'Determining Concavity', parentId: 'calc-5', importance: 'core' },
        { id: 'calc-5-6', code: 'analysis.second-derivative', name: 'Second Derivative Test', parentId: 'calc-5', importance: 'core' },
        { id: 'calc-5-7', code: 'analysis.curve-sketching', name: 'Sketching Graphs of Functions', parentId: 'calc-5', importance: 'core' },
        { id: 'calc-5-8', code: 'analysis.optimization', name: 'Optimization Problems', parentId: 'calc-5', importance: 'core' },

        // Unit 6: Integration and Accumulation of Change (17-20%)
        { id: 'calc-6', code: 'integration', name: 'Integration and Accumulation of Change', importance: 'core', examWeight: 18 },
        { id: 'calc-6-1', code: 'int.riemann', name: 'Riemann Sums', parentId: 'calc-6', importance: 'core' },
        { id: 'calc-6-2', code: 'int.definite', name: 'Definite Integrals', parentId: 'calc-6', importance: 'core' },
        { id: 'calc-6-3', code: 'int.ftc', name: 'Fundamental Theorem of Calculus', parentId: 'calc-6', importance: 'core' },
        { id: 'calc-6-4', code: 'int.antiderivatives', name: 'Finding Antiderivatives', parentId: 'calc-6', importance: 'core' },
        { id: 'calc-6-5', code: 'int.properties', name: 'Properties of Definite Integrals', parentId: 'calc-6', importance: 'core' },
        { id: 'calc-6-6', code: 'int.u-substitution', name: 'u-Substitution', parentId: 'calc-6', importance: 'core' },

        // Unit 7: Differential Equations (6-12%)
        { id: 'calc-7', code: 'diff-eq', name: 'Differential Equations', importance: 'core', examWeight: 9 },
        { id: 'calc-7-1', code: 'de.intro', name: 'Modeling with Differential Equations', parentId: 'calc-7', importance: 'core' },
        { id: 'calc-7-2', code: 'de.slope-fields', name: 'Slope Fields', parentId: 'calc-7', importance: 'core' },
        { id: 'calc-7-3', code: 'de.separation', name: 'Separation of Variables', parentId: 'calc-7', importance: 'core' },
        { id: 'calc-7-4', code: 'de.exponential', name: 'Exponential Models (Growth/Decay)', parentId: 'calc-7', importance: 'core' },

        // Unit 8: Applications of Integration (10-15%)
        { id: 'calc-8', code: 'int-apps', name: 'Applications of Integration', importance: 'core', examWeight: 11 },
        { id: 'calc-8-1', code: 'intapp.average', name: 'Average Value of a Function', parentId: 'calc-8', importance: 'core' },
        { id: 'calc-8-2', code: 'intapp.area', name: 'Finding Area Between Curves', parentId: 'calc-8', importance: 'core' },
        { id: 'calc-8-3', code: 'intapp.volume-disk', name: 'Volume: Disk Method', parentId: 'calc-8', importance: 'core' },
        { id: 'calc-8-4', code: 'intapp.volume-washer', name: 'Volume: Washer Method', parentId: 'calc-8', importance: 'core' },
        { id: 'calc-8-5', code: 'intapp.cross-sections', name: 'Volume: Cross-Sectional Area', parentId: 'calc-8', importance: 'advanced' },
    ],
};

// ===================================
// AP PHYSICS 1
// College Board Units 1-8 (2024-2025)
// ===================================
export const AP_PHYSICS_1: Subject = {
    id: 'ap-physics-1',
    code: 'AP_PHYSICS_1',
    name: 'AP Physics 1',
    topics: [
        // Unit 1: Kinematics (12-18%)
        { id: 'phys-1', code: 'kinematics', name: 'Kinematics', importance: 'core', examWeight: 15 },
        { id: 'phys-1-1', code: 'kin.scalars-vectors', name: 'Scalars and Vectors', parentId: 'phys-1', importance: 'core' },
        { id: 'phys-1-2', code: 'kin.displacement', name: 'Displacement, Velocity, and Acceleration', parentId: 'phys-1', importance: 'core' },
        { id: 'phys-1-3', code: 'kin.motion-1d', name: 'Motion in One Dimension', parentId: 'phys-1', importance: 'core' },
        { id: 'phys-1-4', code: 'kin.motion-2d', name: 'Motion in Two Dimensions (Projectile)', parentId: 'phys-1', importance: 'core' },
        { id: 'phys-1-5', code: 'kin.reference-frames', name: 'Reference Frames and Relative Motion', parentId: 'phys-1', importance: 'advanced' },

        // Unit 2: Force and Translational Dynamics (16-20%)
        { id: 'phys-2', code: 'dynamics', name: 'Force and Translational Dynamics', importance: 'core', examWeight: 18 },
        { id: 'phys-2-1', code: 'dyn.systems', name: 'Systems and Center of Mass', parentId: 'phys-2', importance: 'core' },
        { id: 'phys-2-2', code: 'dyn.free-body', name: 'Forces and Free-Body Diagrams', parentId: 'phys-2', importance: 'core' },
        { id: 'phys-2-3', code: 'dyn.newton-first', name: "Newton's First Law", parentId: 'phys-2', importance: 'core' },
        { id: 'phys-2-4', code: 'dyn.newton-second', name: "Newton's Second Law", parentId: 'phys-2', importance: 'core' },
        { id: 'phys-2-5', code: 'dyn.newton-third', name: "Newton's Third Law", parentId: 'phys-2', importance: 'core' },
        { id: 'phys-2-6', code: 'dyn.gravity', name: 'Gravitational Force', parentId: 'phys-2', importance: 'core' },
        { id: 'phys-2-7', code: 'dyn.friction', name: 'Friction (Kinetic and Static)', parentId: 'phys-2', importance: 'core' },
        { id: 'phys-2-8', code: 'dyn.spring', name: 'Spring Forces', parentId: 'phys-2', importance: 'core' },

        // Unit 3: Work, Energy, and Power (12-18%)
        { id: 'phys-3', code: 'energy', name: 'Work, Energy, and Power', importance: 'core', examWeight: 15 },
        { id: 'phys-3-1', code: 'energy.work', name: 'Work Done by a Force', parentId: 'phys-3', importance: 'core' },
        { id: 'phys-3-2', code: 'energy.kinetic', name: 'Kinetic Energy', parentId: 'phys-3', importance: 'core' },
        { id: 'phys-3-3', code: 'energy.potential', name: 'Potential Energy (Gravitational, Spring)', parentId: 'phys-3', importance: 'core' },
        { id: 'phys-3-4', code: 'energy.conservation', name: 'Conservation of Mechanical Energy', parentId: 'phys-3', importance: 'core' },
        { id: 'phys-3-5', code: 'energy.power', name: 'Power', parentId: 'phys-3', importance: 'core' },

        // Unit 4: Linear Momentum (10-16%)
        { id: 'phys-4', code: 'momentum', name: 'Linear Momentum', importance: 'core', examWeight: 13 },
        { id: 'phys-4-1', code: 'mom.definition', name: 'Momentum and Impulse', parentId: 'phys-4', importance: 'core' },
        { id: 'phys-4-2', code: 'mom.conservation', name: 'Conservation of Momentum', parentId: 'phys-4', importance: 'core' },
        { id: 'phys-4-3', code: 'mom.collisions', name: 'Collisions (Elastic and Inelastic)', parentId: 'phys-4', importance: 'core' },

        // Unit 5: Torque and Rotational Dynamics (10-16%)
        { id: 'phys-5', code: 'rotation', name: 'Torque and Rotational Dynamics', importance: 'core', examWeight: 13 },
        { id: 'phys-5-1', code: 'rot.kinematics', name: 'Rotational Kinematics', parentId: 'phys-5', importance: 'core' },
        { id: 'phys-5-2', code: 'rot.linear-connection', name: 'Connecting Linear and Rotational Motion', parentId: 'phys-5', importance: 'core' },
        { id: 'phys-5-3', code: 'rot.torque', name: 'Torque', parentId: 'phys-5', importance: 'core' },
        { id: 'phys-5-4', code: 'rot.inertia', name: 'Rotational Inertia', parentId: 'phys-5', importance: 'core' },
        { id: 'phys-5-5', code: 'rot.equilibrium', name: 'Rotational Equilibrium', parentId: 'phys-5', importance: 'core' },

        // Unit 6: Energy and Momentum of Rotating Systems (6-10%)
        { id: 'phys-6', code: 'rot-energy', name: 'Energy and Momentum of Rotating Systems', importance: 'core', examWeight: 8 },
        { id: 'phys-6-1', code: 'roten.kinetic', name: 'Rotational Kinetic Energy', parentId: 'phys-6', importance: 'core' },
        { id: 'phys-6-2', code: 'roten.angular-momentum', name: 'Angular Momentum and Impulse', parentId: 'phys-6', importance: 'core' },
        { id: 'phys-6-3', code: 'roten.conservation', name: 'Conservation of Angular Momentum', parentId: 'phys-6', importance: 'core' },

        // Unit 7: Oscillations (6-10%)
        { id: 'phys-7', code: 'oscillations', name: 'Oscillations', importance: 'core', examWeight: 8 },
        { id: 'phys-7-1', code: 'osc.shm', name: 'Simple Harmonic Motion', parentId: 'phys-7', importance: 'core' },
        { id: 'phys-7-2', code: 'osc.pendulum', name: 'Pendulum Motion', parentId: 'phys-7', importance: 'core' },
        { id: 'phys-7-3', code: 'osc.spring-mass', name: 'Spring-Mass Systems', parentId: 'phys-7', importance: 'core' },

        // Unit 8: Fluids (New for 2024-2025, 6-10%)
        { id: 'phys-8', code: 'fluids', name: 'Fluids', importance: 'core', examWeight: 10 },
        { id: 'phys-8-1', code: 'fluid.pressure', name: 'Pressure and Density', parentId: 'phys-8', importance: 'core' },
        { id: 'phys-8-2', code: 'fluid.buoyancy', name: 'Buoyancy and Archimedes Principle', parentId: 'phys-8', importance: 'core' },
        { id: 'phys-8-3', code: 'fluid.continuity', name: 'Fluid Dynamics and Continuity', parentId: 'phys-8', importance: 'core' },
        { id: 'phys-8-4', code: 'fluid.bernoulli', name: "Bernoulli's Equation", parentId: 'phys-8', importance: 'advanced' },
    ],
};

// ===================================
// AP BIOLOGY
// College Board Units 1-8
// ===================================
export const AP_BIOLOGY: Subject = {
    id: 'ap-biology',
    code: 'AP_BIO',
    name: 'AP Biology',
    topics: [
        { id: 'bio-1', code: 'chemistry', name: 'Chemistry of Life', importance: 'core', examWeight: 8 },
        { id: 'bio-1-1', code: 'chem.water', name: 'Structure of Water and Hydrogen Bonding', parentId: 'bio-1', importance: 'core' },
        { id: 'bio-1-2', code: 'chem.macromolecules', name: 'Macromolecules', parentId: 'bio-1', importance: 'core' },
        { id: 'bio-1-3', code: 'chem.nucleic-acids', name: 'Nucleic Acids', parentId: 'bio-1', importance: 'core' },

        { id: 'bio-2', code: 'cell-structure', name: 'Cell Structure and Function', importance: 'core', examWeight: 10 },
        { id: 'bio-2-1', code: 'cell.membrane', name: 'Cell Membrane', parentId: 'bio-2', importance: 'core' },
        { id: 'bio-2-2', code: 'cell.transport', name: 'Cell Transport', parentId: 'bio-2', importance: 'core' },
        { id: 'bio-2-3', code: 'cell.organelles', name: 'Cell Organelles', parentId: 'bio-2', importance: 'core' },

        { id: 'bio-3', code: 'cellular-energetics', name: 'Cellular Energetics', importance: 'core', examWeight: 12 },
        { id: 'bio-3-1', code: 'energy.enzymes', name: 'Enzyme Structure and Catalysis', parentId: 'bio-3', importance: 'core' },
        { id: 'bio-3-2', code: 'energy.photosynthesis', name: 'Photosynthesis', parentId: 'bio-3', importance: 'core' },
        { id: 'bio-3-3', code: 'energy.respiration', name: 'Cellular Respiration', parentId: 'bio-3', importance: 'core' },

        { id: 'bio-4', code: 'cell-cycle', name: 'Cell Communication and Cell Cycle', importance: 'core', examWeight: 10 },
        { id: 'bio-4-1', code: 'cycle.signaling', name: 'Cell Signaling', parentId: 'bio-4', importance: 'core' },
        { id: 'bio-4-2', code: 'cycle.mitosis', name: 'Mitosis', parentId: 'bio-4', importance: 'core' },
        { id: 'bio-4-3', code: 'cycle.meiosis', name: 'Meiosis', parentId: 'bio-4', importance: 'core' },

        { id: 'bio-5', code: 'heredity', name: 'Heredity', importance: 'core', examWeight: 10 },
        { id: 'bio-5-1', code: 'heredity.mendelian', name: 'Mendelian Genetics', parentId: 'bio-5', importance: 'core' },
        { id: 'bio-5-2', code: 'heredity.non-mendelian', name: 'Non-Mendelian Genetics', parentId: 'bio-5', importance: 'core' },
        { id: 'bio-5-3', code: 'heredity.chromosomes', name: 'Chromosomal Inheritance', parentId: 'bio-5', importance: 'core' },

        { id: 'bio-6', code: 'gene-expression', name: 'Gene Expression and Regulation', importance: 'core', examWeight: 15 },
        { id: 'bio-6-1', code: 'gene.dna-replication', name: 'DNA Replication', parentId: 'bio-6', importance: 'core' },
        { id: 'bio-6-2', code: 'gene.transcription', name: 'Transcription', parentId: 'bio-6', importance: 'core' },
        { id: 'bio-6-3', code: 'gene.translation', name: 'Translation', parentId: 'bio-6', importance: 'core' },
        { id: 'bio-6-4', code: 'gene.regulation', name: 'Gene Regulation', parentId: 'bio-6', importance: 'core' },

        { id: 'bio-7', code: 'natural-selection', name: 'Natural Selection', importance: 'core', examWeight: 15 },
        { id: 'bio-7-1', code: 'ns.evidence', name: 'Evidence of Evolution', parentId: 'bio-7', importance: 'core' },
        { id: 'bio-7-2', code: 'ns.mechanisms', name: 'Mechanisms of Evolution', parentId: 'bio-7', importance: 'core' },
        { id: 'bio-7-3', code: 'ns.speciation', name: 'Speciation', parentId: 'bio-7', importance: 'core' },

        { id: 'bio-8', code: 'ecology', name: 'Ecology', importance: 'core', examWeight: 20 },
        { id: 'bio-8-1', code: 'eco.populations', name: 'Population Dynamics', parentId: 'bio-8', importance: 'core' },
        { id: 'bio-8-2', code: 'eco.communities', name: 'Community Ecology', parentId: 'bio-8', importance: 'core' },
        { id: 'bio-8-3', code: 'eco.ecosystems', name: 'Ecosystem Dynamics', parentId: 'bio-8', importance: 'core' },
    ],
};

// ===================================
// AP PSYCHOLOGY
// College Board Units 1-9
// ===================================
export const AP_PSYCHOLOGY: Subject = {
    id: 'ap-psychology',
    code: 'AP_PSYCH',
    name: 'AP Psychology',
    topics: [
        { id: 'psych-1', code: 'scientific-foundations', name: 'Scientific Foundations of Psychology', importance: 'core', examWeight: 10 },
        { id: 'psych-1-1', code: 'sci.history', name: 'History of Psychology', parentId: 'psych-1', importance: 'core' },
        { id: 'psych-1-2', code: 'sci.research-methods', name: 'Research Methods', parentId: 'psych-1', importance: 'core' },

        { id: 'psych-2', code: 'biological-bases', name: 'Biological Bases of Behavior', importance: 'core', examWeight: 8 },
        { id: 'psych-2-1', code: 'bio.neurons', name: 'Neurons and Neural Communication', parentId: 'psych-2', importance: 'core' },
        { id: 'psych-2-2', code: 'bio.brain', name: 'Brain Structure and Function', parentId: 'psych-2', importance: 'core' },
        { id: 'psych-2-3', code: 'bio.endocrine', name: 'Endocrine System', parentId: 'psych-2', importance: 'core' },

        { id: 'psych-3', code: 'sensation-perception', name: 'Sensation and Perception', importance: 'core', examWeight: 6 },
        { id: 'psych-3-1', code: 'sense.vision', name: 'Vision', parentId: 'psych-3', importance: 'core' },
        { id: 'psych-3-2', code: 'sense.hearing', name: 'Hearing', parentId: 'psych-3', importance: 'core' },
        { id: 'psych-3-3', code: 'sense.perception', name: 'Perception Principles', parentId: 'psych-3', importance: 'core' },

        { id: 'psych-4', code: 'learning', name: 'Learning', importance: 'core', examWeight: 7 },
        { id: 'psych-4-1', code: 'learn.classical', name: 'Classical Conditioning', parentId: 'psych-4', importance: 'core' },
        { id: 'psych-4-2', code: 'learn.operant', name: 'Operant Conditioning', parentId: 'psych-4', importance: 'core' },
        { id: 'psych-4-3', code: 'learn.observational', name: 'Observational Learning', parentId: 'psych-4', importance: 'core' },

        { id: 'psych-5', code: 'cognitive', name: 'Cognitive Psychology', importance: 'core', examWeight: 13 },
        { id: 'psych-5-1', code: 'cog.memory', name: 'Memory', parentId: 'psych-5', importance: 'core' },
        { id: 'psych-5-2', code: 'cog.thinking', name: 'Thinking and Problem Solving', parentId: 'psych-5', importance: 'core' },
        { id: 'psych-5-3', code: 'cog.language', name: 'Language', parentId: 'psych-5', importance: 'core' },

        { id: 'psych-6', code: 'developmental', name: 'Developmental Psychology', importance: 'core', examWeight: 7 },
        { id: 'psych-6-1', code: 'dev.lifespan', name: 'Lifespan Development', parentId: 'psych-6', importance: 'core' },
        { id: 'psych-6-2', code: 'dev.cognitive', name: 'Cognitive Development', parentId: 'psych-6', importance: 'core' },

        { id: 'psych-7', code: 'motivation-emotion', name: 'Motivation, Emotion, and Personality', importance: 'core', examWeight: 11 },
        { id: 'psych-7-1', code: 'mot.theories', name: 'Motivation Theories', parentId: 'psych-7', importance: 'core' },
        { id: 'psych-7-2', code: 'mot.emotion', name: 'Emotion Theories', parentId: 'psych-7', importance: 'core' },
        { id: 'psych-7-3', code: 'mot.personality', name: 'Personality Theories', parentId: 'psych-7', importance: 'core' },

        { id: 'psych-8', code: 'clinical', name: 'Clinical Psychology', importance: 'core', examWeight: 12 },
        { id: 'psych-8-1', code: 'clin.disorders', name: 'Psychological Disorders', parentId: 'psych-8', importance: 'core' },
        { id: 'psych-8-2', code: 'clin.treatment', name: 'Treatment Approaches', parentId: 'psych-8', importance: 'core' },

        { id: 'psych-9', code: 'social', name: 'Social Psychology', importance: 'core', examWeight: 8 },
        { id: 'psych-9-1', code: 'social.attribution', name: 'Attribution and Attitudes', parentId: 'psych-9', importance: 'core' },
        { id: 'psych-9-2', code: 'social.conformity', name: 'Conformity and Obedience', parentId: 'psych-9', importance: 'core' },
        { id: 'psych-9-3', code: 'social.group', name: 'Group Dynamics', parentId: 'psych-9', importance: 'core' },
    ],
};

// ===================================
// AP US HISTORY
// College Board Units 1-9
// ===================================
export const AP_US_HISTORY: Subject = {
    id: 'ap-us-history',
    code: 'AP_USH',
    name: 'AP US History',
    topics: [
        { id: 'ush-1', code: 'colonial', name: 'Period 1: 1491-1607', importance: 'core', examWeight: 4 },
        { id: 'ush-1-1', code: 'colonial.natives', name: 'Native American Societies', parentId: 'ush-1', importance: 'core' },
        { id: 'ush-1-2', code: 'colonial.contact', name: 'European Contact', parentId: 'ush-1', importance: 'core' },

        { id: 'ush-2', code: 'colonization', name: 'Period 2: 1607-1754', importance: 'core', examWeight: 6 },
        { id: 'ush-2-1', code: 'colon.british', name: 'British Colonization', parentId: 'ush-2', importance: 'core' },
        { id: 'ush-2-2', code: 'colon.slavery', name: 'Development of Slavery', parentId: 'ush-2', importance: 'core' },

        { id: 'ush-3', code: 'revolution', name: 'Period 3: 1754-1800', importance: 'core', examWeight: 10 },
        { id: 'ush-3-1', code: 'rev.causes', name: 'Causes of Revolution', parentId: 'ush-3', importance: 'core' },
        { id: 'ush-3-2', code: 'rev.war', name: 'Revolutionary War', parentId: 'ush-3', importance: 'core' },
        { id: 'ush-3-3', code: 'rev.constitution', name: 'Constitution and Early Republic', parentId: 'ush-3', importance: 'core' },

        { id: 'ush-4', code: 'expansion', name: 'Period 4: 1800-1848', importance: 'core', examWeight: 10 },
        { id: 'ush-4-1', code: 'exp.democracy', name: 'Jacksonian Democracy', parentId: 'ush-4', importance: 'core' },
        { id: 'ush-4-2', code: 'exp.manifest', name: 'Manifest Destiny', parentId: 'ush-4', importance: 'core' },
        { id: 'ush-4-3', code: 'exp.reform', name: 'Reform Movements', parentId: 'ush-4', importance: 'core' },

        { id: 'ush-5', code: 'civil-war', name: 'Period 5: 1844-1877', importance: 'core', examWeight: 13 },
        { id: 'ush-5-1', code: 'cw.causes', name: 'Causes of Civil War', parentId: 'ush-5', importance: 'core' },
        { id: 'ush-5-2', code: 'cw.war', name: 'Civil War', parentId: 'ush-5', importance: 'core' },
        { id: 'ush-5-3', code: 'cw.reconstruction', name: 'Reconstruction', parentId: 'ush-5', importance: 'core' },

        { id: 'ush-6', code: 'gilded', name: 'Period 6: 1865-1898', importance: 'core', examWeight: 13 },
        { id: 'ush-6-1', code: 'gild.industrialization', name: 'Industrialization', parentId: 'ush-6', importance: 'core' },
        { id: 'ush-6-2', code: 'gild.west', name: 'The American West', parentId: 'ush-6', importance: 'core' },
        { id: 'ush-6-3', code: 'gild.immigration', name: 'Immigration', parentId: 'ush-6', importance: 'core' },

        { id: 'ush-7', code: 'modern', name: 'Period 7: 1890-1945', importance: 'core', examWeight: 17 },
        { id: 'ush-7-1', code: 'mod.progressive', name: 'Progressive Era', parentId: 'ush-7', importance: 'core' },
        { id: 'ush-7-2', code: 'mod.wwi', name: 'World War I', parentId: 'ush-7', importance: 'core' },
        { id: 'ush-7-3', code: 'mod.1920s', name: 'The 1920s', parentId: 'ush-7', importance: 'core' },
        { id: 'ush-7-4', code: 'mod.depression', name: 'Great Depression and New Deal', parentId: 'ush-7', importance: 'core' },
        { id: 'ush-7-5', code: 'mod.wwii', name: 'World War II', parentId: 'ush-7', importance: 'core' },

        { id: 'ush-8', code: 'cold-war', name: 'Period 8: 1945-1980', importance: 'core', examWeight: 15 },
        { id: 'ush-8-1', code: 'cold.origins', name: 'Cold War Origins', parentId: 'ush-8', importance: 'core' },
        { id: 'ush-8-2', code: 'cold.civil-rights', name: 'Civil Rights Movement', parentId: 'ush-8', importance: 'core' },
        { id: 'ush-8-3', code: 'cold.vietnam', name: 'Vietnam War', parentId: 'ush-8', importance: 'core' },

        { id: 'ush-9', code: 'contemporary', name: 'Period 9: 1980-Present', importance: 'core', examWeight: 12 },
        { id: 'ush-9-1', code: 'contemp.reagan', name: 'Reagan Era', parentId: 'ush-9', importance: 'core' },
        { id: 'ush-9-2', code: 'contemp.globalization', name: 'Globalization', parentId: 'ush-9', importance: 'core' },
    ],
};

// ===================================
// AP WORLD HISTORY: MODERN
// College Board Units 1-9
// ===================================
export const AP_WORLD_HISTORY: Subject = {
    id: 'ap-world-history',
    code: 'AP_WORLD',
    name: 'AP World History: Modern',
    topics: [
        { id: 'wh-1', code: 'global-tapestry', name: 'Unit 1: The Global Tapestry (1200-1450)', importance: 'core', examWeight: 8 },
        { id: 'wh-1-1', code: 'gt.song-china', name: 'Song Dynasty China', parentId: 'wh-1', importance: 'core' },
        { id: 'wh-1-2', code: 'gt.islamic', name: 'Islamic Empires', parentId: 'wh-1', importance: 'core' },
        { id: 'wh-1-3', code: 'gt.americas', name: 'State Building in the Americas', parentId: 'wh-1', importance: 'core' },

        { id: 'wh-2', code: 'networks', name: 'Unit 2: Networks of Exchange (1200-1450)', importance: 'core', examWeight: 8 },
        { id: 'wh-2-1', code: 'net.silk-road', name: 'Silk Roads', parentId: 'wh-2', importance: 'core' },
        { id: 'wh-2-2', code: 'net.mongols', name: 'Mongol Empire', parentId: 'wh-2', importance: 'core' },
        { id: 'wh-2-3', code: 'net.indian-ocean', name: 'Indian Ocean Trade', parentId: 'wh-2', importance: 'core' },

        { id: 'wh-3', code: 'land-based', name: 'Unit 3: Land-Based Empires (1450-1750)', importance: 'core', examWeight: 12 },
        { id: 'wh-3-1', code: 'lbe.ottoman', name: 'Ottoman Empire', parentId: 'wh-3', importance: 'core' },
        { id: 'wh-3-2', code: 'lbe.mughal', name: 'Mughal Empire', parentId: 'wh-3', importance: 'core' },
        { id: 'wh-3-3', code: 'lbe.qing', name: 'Qing Dynasty', parentId: 'wh-3', importance: 'core' },

        { id: 'wh-4', code: 'transoceanic', name: 'Unit 4: Transoceanic Interconnections (1450-1750)', importance: 'core', examWeight: 12 },
        { id: 'wh-4-1', code: 'trans.exploration', name: 'European Exploration', parentId: 'wh-4', importance: 'core' },
        { id: 'wh-4-2', code: 'trans.columbian', name: 'Columbian Exchange', parentId: 'wh-4', importance: 'core' },
        { id: 'wh-4-3', code: 'trans.atlantic-slave', name: 'Atlantic Slave Trade', parentId: 'wh-4', importance: 'core' },

        { id: 'wh-5', code: 'revolutions', name: 'Unit 5: Revolutions (1750-1900)', importance: 'core', examWeight: 12 },
        { id: 'wh-5-1', code: 'rev.enlightenment', name: 'Enlightenment', parentId: 'wh-5', importance: 'core' },
        { id: 'wh-5-2', code: 'rev.political', name: 'Political Revolutions', parentId: 'wh-5', importance: 'core' },
        { id: 'wh-5-3', code: 'rev.industrial', name: 'Industrial Revolution', parentId: 'wh-5', importance: 'core' },

        { id: 'wh-6', code: 'consequences', name: 'Unit 6: Consequences of Industrialization (1750-1900)', importance: 'core', examWeight: 12 },
        { id: 'wh-6-1', code: 'conseq.imperialism', name: 'Imperialism', parentId: 'wh-6', importance: 'core' },
        { id: 'wh-6-2', code: 'conseq.resistance', name: 'Resistance to Imperialism', parentId: 'wh-6', importance: 'core' },

        { id: 'wh-7', code: 'global-conflict', name: 'Unit 7: Global Conflict (1900-Present)', importance: 'core', examWeight: 8 },
        { id: 'wh-7-1', code: 'gc.wwi', name: 'World War I', parentId: 'wh-7', importance: 'core' },
        { id: 'wh-7-2', code: 'gc.interwar', name: 'Interwar Period', parentId: 'wh-7', importance: 'core' },
        { id: 'wh-7-3', code: 'gc.wwii', name: 'World War II', parentId: 'wh-7', importance: 'core' },

        { id: 'wh-8', code: 'cold-war', name: 'Unit 8: Cold War and Decolonization (1900-Present)', importance: 'core', examWeight: 8 },
        { id: 'wh-8-1', code: 'cw.origins', name: 'Cold War', parentId: 'wh-8', importance: 'core' },
        { id: 'wh-8-2', code: 'cw.decolonization', name: 'Decolonization', parentId: 'wh-8', importance: 'core' },

        { id: 'wh-9', code: 'globalization', name: 'Unit 9: Globalization (1900-Present)', importance: 'core', examWeight: 8 },
        { id: 'wh-9-1', code: 'glob.technology', name: 'Technology and Globalization', parentId: 'wh-9', importance: 'core' },
        { id: 'wh-9-2', code: 'glob.environment', name: 'Environmental Consequences', parentId: 'wh-9', importance: 'core' },
    ],
};

// ===================================
// AP CHEMISTRY
// College Board Units 1-9
// ===================================
export const AP_CHEMISTRY: Subject = {
    id: 'ap-chemistry',
    code: 'AP_CHEM',
    name: 'AP Chemistry',
    topics: [
        { id: 'chem-1', code: 'atomic-structure', name: 'Atomic Structure and Properties', importance: 'core', examWeight: 7 },
        { id: 'chem-1-1', code: 'atom.structure', name: 'Atomic Structure', parentId: 'chem-1', importance: 'core' },
        { id: 'chem-1-2', code: 'atom.isotopes', name: 'Isotopes and Mass Spectrometry', parentId: 'chem-1', importance: 'core' },
        { id: 'chem-1-3', code: 'atom.electron-config', name: 'Electron Configuration', parentId: 'chem-1', importance: 'core' },
        { id: 'chem-1-4', code: 'atom.periodic-trends', name: 'Periodic Trends', parentId: 'chem-1', importance: 'core' },

        { id: 'chem-2', code: 'molecular', name: 'Molecular and Ionic Compound Structure', importance: 'core', examWeight: 7 },
        { id: 'chem-2-1', code: 'mol.lewis', name: 'Lewis Structures', parentId: 'chem-2', importance: 'core' },
        { id: 'chem-2-2', code: 'mol.vsepr', name: 'VSEPR Theory', parentId: 'chem-2', importance: 'core' },
        { id: 'chem-2-3', code: 'mol.bond-hybridization', name: 'Bond Hybridization', parentId: 'chem-2', importance: 'core' },

        { id: 'chem-3', code: 'imf', name: 'Intermolecular Forces', importance: 'core', examWeight: 18 },
        { id: 'chem-3-1', code: 'imf.types', name: 'Types of IMF', parentId: 'chem-3', importance: 'core' },
        { id: 'chem-3-2', code: 'imf.properties', name: 'Properties of Solids, Liquids, Gases', parentId: 'chem-3', importance: 'core' },
        { id: 'chem-3-3', code: 'imf.ideal-gas', name: 'Ideal Gas Law', parentId: 'chem-3', importance: 'core' },

        { id: 'chem-4', code: 'reactions', name: 'Chemical Reactions', importance: 'core', examWeight: 7 },
        { id: 'chem-4-1', code: 'rxn.types', name: 'Types of Reactions', parentId: 'chem-4', importance: 'core' },
        { id: 'chem-4-2', code: 'rxn.stoichiometry', name: 'Stoichiometry', parentId: 'chem-4', importance: 'core' },

        { id: 'chem-5', code: 'kinetics', name: 'Kinetics', importance: 'core', examWeight: 7 },
        { id: 'chem-5-1', code: 'kin.rate-laws', name: 'Rate Laws', parentId: 'chem-5', importance: 'core' },
        { id: 'chem-5-2', code: 'kin.mechanisms', name: 'Reaction Mechanisms', parentId: 'chem-5', importance: 'core' },
        { id: 'chem-5-3', code: 'kin.catalysis', name: 'Catalysis', parentId: 'chem-5', importance: 'core' },

        { id: 'chem-6', code: 'thermodynamics', name: 'Thermodynamics', importance: 'core', examWeight: 7 },
        { id: 'chem-6-1', code: 'thermo.enthalpy', name: 'Enthalpy', parentId: 'chem-6', importance: 'core' },
        { id: 'chem-6-2', code: 'thermo.entropy', name: 'Entropy', parentId: 'chem-6', importance: 'core' },
        { id: 'chem-6-3', code: 'thermo.gibbs', name: 'Gibbs Free Energy', parentId: 'chem-6', importance: 'core' },

        { id: 'chem-7', code: 'equilibrium', name: 'Equilibrium', importance: 'core', examWeight: 7 },
        { id: 'chem-7-1', code: 'eq.constants', name: 'Equilibrium Constants', parentId: 'chem-7', importance: 'core' },
        { id: 'chem-7-2', code: 'eq.le-chatelier', name: "Le Chatelier's Principle", parentId: 'chem-7', importance: 'core' },

        { id: 'chem-8', code: 'acids-bases', name: 'Acids and Bases', importance: 'core', examWeight: 11 },
        { id: 'chem-8-1', code: 'ab.ph', name: 'pH and pOH', parentId: 'chem-8', importance: 'core' },
        { id: 'chem-8-2', code: 'ab.buffers', name: 'Buffers', parentId: 'chem-8', importance: 'core' },
        { id: 'chem-8-3', code: 'ab.titrations', name: 'Titrations', parentId: 'chem-8', importance: 'core' },

        { id: 'chem-9', code: 'electrochemistry', name: 'Applications of Thermodynamics', importance: 'core', examWeight: 7 },
        { id: 'chem-9-1', code: 'electro.galvanic', name: 'Galvanic Cells', parentId: 'chem-9', importance: 'core' },
        { id: 'chem-9-2', code: 'electro.electrolytic', name: 'Electrolytic Cells', parentId: 'chem-9', importance: 'core' },
    ],
};

// ===================================
// ALL AP SUBJECTS
// ===================================
export const AP_SUBJECTS: Subject[] = [
    AP_CALCULUS_AB,
    AP_PHYSICS_1,
    AP_BIOLOGY,
    AP_PSYCHOLOGY,
    AP_US_HISTORY,
    AP_WORLD_HISTORY,
    AP_CHEMISTRY,
];

// Helper: Get all topics as flat array
export function getAllTopics(subject: Subject): Topic[] {
    return subject.topics;
}

// Helper: Get parent topics only (units)
export function getUnits(subject: Subject): Topic[] {
    return subject.topics.filter(t => !t.parentId);
}

export function getTopicsByUnit(subject: Subject, unitId: string): Topic[] {
    return subject.topics.filter(t => t.parentId === unitId);
}

// Helper: Find topic by code across all subjects
export function findTopicByCode(code: string): Topic | undefined {
    for (const subject of AP_SUBJECTS) {
        const topic = subject.topics.find(t => t.code === code);
        if (topic) return topic;
    }
    return undefined;
}

