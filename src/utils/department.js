const Fuse = require("fuse.js");

// Canonical departments
const departments = [
    { key: "dentist", label: "Dentistry", synonyms: ["dentist", "dental", "tooth", "teeth"] },
    { key: "cardiology", label: "Cardiology", synonyms: ["cardiology", "cardio", "heart"] },
    { key: "orthopedics", label: "Orthopedics", synonyms: ["ortho", "orthopedic", "bone", "joint"] },
    { key: "dermatology", label: "Dermatology", synonyms: ["derma", "dermatology", "skin"] },
    { key: "ent", label: "ENT", synonyms: ["ent", "ear nose throat"] },
    { key: "ophthalmology", label: "Ophthalmology", synonyms: ["eye", "ophthalmology", "vision"] },
    { key: "general", label: "General Medicine", synonyms: ["general", "physician", "doctor"] },
];

const fuse = new Fuse(
    departments.flatMap((d) => d.synonyms.map((s) => ({ synonym: s, key: d.key }))),
    { keys: ["synonym"], threshold: 0.3 }
);

function detectDepartmentFuzzy(textLower) {
    // direct keyword match first (fast)
    for (const d of departments) {
        for (const s of d.synonyms) {
            if (textLower.includes(s)) return d.key;
        }
    }

    // fuzzy fallback
    const words = textLower.split(/\s+/).filter(Boolean);
    for (const w of words) {
        const res = fuse.search(w);
        if (res.length > 0) {
            return res[0].item.key;
        }
    }

    return null;
}

function normalizeDepartment(deptKey) {
    const found = departments.find((d) => d.key === deptKey);
    return found ? found.label : deptKey;
}

module.exports = {
    detectDepartmentFuzzy,
    normalizeDepartment,
};
