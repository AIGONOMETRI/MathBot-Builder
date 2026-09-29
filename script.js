/* =========================================================
   MATHBOT BUILDER
   Rule-Based Chatbot Builder
   Version 1.0
========================================================= */


/* =========================================================
   PROJECT DATA
========================================================= */

let project = {
    botName: "",
    groupName: "",
    className: "",
    material: "",
    members: ""
};

let rules = [];

let testHistory = [];

let currentStep = 1;

let editingRuleIndex = null;

let currentResponseImage = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadProject();

    updateAllDisplays();

    setupPreviewEnterKey();

});


/* =========================================================
   STEP NAVIGATION
========================================================= */

function goToStep(step) {

    saveProjectData();

    if (step === 2) {

        if (!validateIdentity()) {
            return;
        }

    }

    if (step === 3) {

        if (rules.length === 0) {

            alert(
                "Tambahkan minimal satu knowledge base sebelum membuka preview chatbot."
            );

            return;
        }

    }

    if (step === 5) {

        updateExportSummary();

    }


    document.querySelectorAll(".step-panel")
        .forEach(panel => {
            panel.classList.remove("active");
        });


    const target = document.getElementById(`step${step}`);

    if (target) {
        target.classList.add("active");
    }


    currentStep = step;

    updateProgress(step);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    updateAllDisplays();
}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress(step) {

    document.querySelectorAll(".progress-step")
        .forEach(item => {

            const number =
                Number(item.dataset.step);

            item.classList.remove("active");
            item.classList.remove("completed");

            if (number === step) {
                item.classList.add("active");
            }

            if (number < step) {
                item.classList.add("completed");
            }

        });

}


/* =========================================================
   IDENTITY
========================================================= */

function saveProjectData() {

    project.botName =
        document.getElementById("botName").value.trim();

    project.groupName =
        document.getElementById("groupName").value.trim();

    project.className =
        document.getElementById("className").value;

    project.material =
        document.getElementById("material").value;

    project.members =
        document.getElementById("members").value.trim();


    saveToLocalStorage();

}


/* =========================================================
   IDENTITY VALIDATION
========================================================= */

function validateIdentity() {

    saveProjectData();

    if (!project.botName) {

        alert("Silakan isi nama chatbot.");

        document.getElementById("botName").focus();

        return false;
    }


    if (!project.groupName) {

        alert("Silakan isi nama kelompok.");

        document.getElementById("groupName").focus();

        return false;
    }


    if (!project.className) {

        alert("Silakan pilih kelas.");

        document.getElementById("className").focus();

        return false;
    }


    if (!project.material) {

        alert("Silakan pilih materi.");

        document.getElementById("material").focus();

        return false;
    }


    return true;
}


/* =========================================================
   RULE MANAGEMENT
========================================================= */

function saveRule() {

    const keywordsInput =
        document.getElementById("keywords");

    const questionInput =
        document.getElementById("questionExample");

    const categoryInput =
        document.getElementById("category");

    const responseInput =
        document.getElementById("response");


    const keywordsRaw =
        keywordsInput.value.trim();

    const question =
        questionInput.value.trim();

    const category =
        categoryInput.value;

    const response =
        responseInput.value.trim();

    const image =
        currentResponseImage;


    if (!keywordsRaw) {

        alert("Masukkan minimal satu kata kunci.");

        keywordsInput.focus();

        return;
    }


    if (!response && !image) {

        alert("Masukkan respons teks atau tambahkan gambar.");

        responseInput.focus();

        return;
    }


    const keywords = keywordsRaw
        .split(",")
        .map(keyword => normalizeText(keyword))
        .filter(keyword => keyword.length > 0);


    if (keywords.length === 0) {

        alert("Kata kunci tidak valid.");

        return;
    }


    const newRule = {

        keywords: [...new Set(keywords)],

        question: question,

        category: category,

        response: response,

        image: image || null

    };


    if (editingRuleIndex !== null) {

        rules[editingRuleIndex] = newRule;

        alert("Rule berhasil diperbarui.");

    } else {

        rules.push(newRule);

    }


    clearRuleForm();

    displayRules();

    updateAllDisplays();

    saveToLocalStorage();

}


/* =========================================================
   DISPLAY RULES
========================================================= */

function displayRules() {

    const container =
        document.getElementById("rulesContainer");

    const counter =
        document.getElementById("ruleCounter");


    counter.textContent =
        `${rules.length} Rule`;


    if (rules.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-data'></i>
                <h3>Belum ada knowledge base</h3>
                <p>
                    Tambahkan pengetahuan pertama chatbot kalian.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    rules.forEach((rule, index) => {

        const card =
            document.createElement("div");

        card.className = "rule-card";


        /* Header */

        const header =
            document.createElement("div");

        header.className =
            "rule-card-header";


        const title =
            document.createElement("div");

        title.className =
            "rule-title";


        const number =
            document.createElement("div");

        number.className =
            "rule-number";

        number.textContent =
            index + 1;


        const titleText =
            document.createElement("div");


        const heading =
            document.createElement("h4");

        heading.textContent =
            rule.question ||
            "Pengetahuan tanpa contoh pertanyaan";


        const category =
            document.createElement("span");

        category.className =
            "category-badge";

        category.textContent =
            rule.category;


        titleText.appendChild(heading);

        titleText.appendChild(category);


        title.appendChild(number);

        title.appendChild(titleText);


        /* Action buttons */

        const actions =
            document.createElement("div");

        actions.className =
            "rule-actions";


        const editButton =
            document.createElement("button");

        editButton.className =
            "icon-button";

        editButton.title =
            "Edit Rule";

        editButton.innerHTML =
            "<i class='bx bx-edit'></i>";

        editButton.onclick =
            () => editRule(index);


        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "icon-button delete";

        deleteButton.title =
            "Hapus Rule";

        deleteButton.innerHTML =
            "<i class='bx bx-trash'></i>";

        deleteButton.onclick =
            () => deleteRule(index);


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        header.appendChild(title);

        header.appendChild(actions);


        /* Keywords */

        const keywords =
            document.createElement("div");

        keywords.className =
            "rule-keywords";


        rule.keywords.forEach(keyword => {

            const tag =
                document.createElement("span");

            tag.className =
                "keyword-tag";

            tag.textContent =
                keyword;

            keywords.appendChild(tag);

        });


        /* Question */

        const question =
            document.createElement("div");

        question.className =
            "rule-question";

        question.textContent =
            rule.question
                ? `Pertanyaan contoh: ${rule.question}`
                : "Tidak ada pertanyaan contoh";


        /* Response */

        const response =
            document.createElement("div");

        response.className =
            "rule-response";

        response.textContent =
            rule.response || "";


        card.appendChild(header);

        card.appendChild(keywords);

        card.appendChild(question);

        if (rule.response) {
            card.appendChild(response);
        }

        if (rule.image && rule.image.dataUrl) {

            const imageWrapper =
                document.createElement("div");

            imageWrapper.className =
                "rule-response-image";

            const image =
                document.createElement("img");

            image.src =
                rule.image.dataUrl;

            image.alt =
                rule.image.name || "Gambar respons rule";

            imageWrapper.appendChild(image);

            card.appendChild(imageWrapper);
        }


        container.appendChild(card);

    });


    renderMath(container);

}


/* =========================================================
   EDIT RULE
========================================================= */

function editRule(index) {

    const rule = rules[index];

    editingRuleIndex = index;


    document.getElementById("keywords").value =
        rule.keywords.join(", ");

    document.getElementById("questionExample").value =
        rule.question || "";

    document.getElementById("category").value =
        rule.category;

    document.getElementById("response").value =
        rule.response || "";

    setResponseImage(rule.image || null);


    document.getElementById("ruleFormTitle")
        .textContent =
        "Edit Knowledge Base";


    document.getElementById("editingStatus")
        .textContent =
        `Mengedit Rule ${index + 1}`;


    const saveButton =
        document.getElementById("saveRuleButton");

    saveButton.innerHTML =
        "<i class='bx bx-save'></i> Simpan Perubahan";


    document.getElementById("cancelEditButton")
        .classList.remove("hidden");


    document
        .getElementById("keywords")
        .focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CANCEL EDIT
========================================================= */

function cancelEdit() {

    editingRuleIndex = null;

    clearRuleForm();

}


/* =========================================================
   CLEAR RULE FORM
========================================================= */

function clearRuleForm() {

    document.getElementById("keywords").value = "";

    document.getElementById("questionExample").value = "";

    document.getElementById("category").value = "Konsep";

    document.getElementById("response").value = "";

    setResponseImage(null);


    document.getElementById("ruleFormTitle")
        .textContent =
        "Tambahkan Pengetahuan";


    document.getElementById("editingStatus")
        .textContent =
        "Rule baru";


    document.getElementById("saveRuleButton")
        .innerHTML =
        "<i class='bx bx-plus'></i> Tambah Rule";


    document.getElementById("cancelEditButton")
        .classList.add("hidden");


    editingRuleIndex = null;

}


/* =========================================================
   RESPONSE IMAGE
========================================================= */

function handleImageSelection(input) {

    const file = input.files && input.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("File yang dipilih harus berupa gambar.");
        input.value = "";
        return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
        alert("Ukuran gambar maksimal 2 MB.");
        input.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        setResponseImage({
            dataUrl: event.target.result,
            name: file.name,
            type: file.type
        });

    };

    reader.onerror = function () {

        alert("Gambar tidak dapat dibaca. Silakan coba gambar lain.");
        input.value = "";

    };

    reader.readAsDataURL(file);
}


function setResponseImage(image) {

    currentResponseImage =
        image || null;

    const preview =
        document.getElementById("imagePreview");

    const previewImg =
        document.getElementById("imagePreviewImg");

    const previewName =
        document.getElementById("imagePreviewName");

    const input =
        document.getElementById("responseImage");

    if (!preview || !previewImg || !previewName) {
        return;
    }

    if (!image) {

        preview.classList.add("hidden");
        previewImg.src = "";
        previewName.textContent = "";

        if (input) {
            input.value = "";
        }

        return;
    }

    previewImg.src =
        image.dataUrl;

    previewName.textContent =
        image.name || "Gambar respons";

    preview.classList.remove("hidden");
}


function removeResponseImage() {

    setResponseImage(null);

}


/* =========================================================
   DELETE RULE
========================================================= */

function deleteRule(index) {

    const confirmation =
        confirm(
            `Hapus Rule ${index + 1}?\n\nRule yang dihapus tidak dapat digunakan chatbot.`
        );


    if (!confirmation) {
        return;
    }


    rules.splice(index, 1);


    displayRules();

    updateAllDisplays();

    saveToLocalStorage();

}


/* =========================================================
   CHATBOT ENGINE
========================================================= */

function findBestResponse(userInput) {

    const normalizedInput =
        normalizeText(userInput);


    if (!normalizedInput) {

        return {
            found: false,
            response:
                "Silakan tuliskan pertanyaan terlebih dahulu."
        };

    }


    let bestRule = null;

    let bestScore = 0;


    rules.forEach(rule => {

        let score = 0;


        rule.keywords.forEach(keyword => {

            if (!keyword) {
                return;
            }


            const normalizedKeyword =
                normalizeText(keyword);


            if (
                normalizedInput
                    .includes(normalizedKeyword)
            ) {

                /*
                    Semakin panjang keyword,
                    semakin tinggi skor.

                    Tujuannya agar keyword yang lebih spesifik
                    memiliki prioritas dibanding keyword umum.
                */

                score +=
                    normalizedKeyword.length;

            }

        });


        if (score > bestScore) {

            bestScore = score;

            bestRule = rule;

        }

    });


    if (bestRule) {

        return {

            found: true,

            response: bestRule.response || "",

            image: bestRule.image || null,

            rule: bestRule

        };

    }


    return {

        found: false,

        response:
            "Maaf, saya belum menemukan pengetahuan yang sesuai dengan pertanyaan tersebut. Coba gunakan kata kunci lain atau tanyakan dengan cara berbeda."

    };

}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}


/* =========================================================
   PREVIEW CHAT
========================================================= */

function sendPreviewMessage() {

    const input =
        document.getElementById("previewInput");

    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    addChatMessage(
        "outgoing",
        message
    );


    input.value = "";


    const result =
        findBestResponse(message);


    setTimeout(() => {

        addChatMessage(
            "incoming",
            result.response,
            result.image
        );

        renderMath(
            document.getElementById("previewChatbox")
        );

    }, 350);

}


/* =========================================================
   ADD CHAT MESSAGE
========================================================= */

function addChatMessage(type, message, image = null) {

    const chatbox =
        document.getElementById("previewChatbox");

    const chat =
        document.createElement("div");

    chat.className =
        `chat ${type}`;

    if (type === "incoming") {

        chat.innerHTML = `
            <div class="chat-avatar">
                <i class='bx bx-bot'></i>
            </div>

            <div class="chat-message">
                <span class="chat-name">
                    Chatbot
                </span>
                <div class="chat-content"></div>
            </div>
        `;

    } else {

        chat.innerHTML = `
            <div class="chat-message">
                <span class="chat-name">
                    Kamu
                </span>
                <div class="chat-content"></div>
            </div>
        `;

    }

    const content =
        chat.querySelector(".chat-content");

    if (message) {

        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            message;

        content.appendChild(paragraph);

    }

    if (image && image.dataUrl) {

        const imageElement =
            document.createElement("img");

        imageElement.className =
            "chat-response-image";

        imageElement.src =
            image.dataUrl;

        imageElement.alt =
            image.name || "Gambar respons chatbot";

        imageElement.loading =
            "lazy";

        content.appendChild(imageElement);

    }

    chatbox.appendChild(chat);

    chatbox.scrollTop =
        chatbox.scrollHeight;

    renderMath(chat);

}



/* =========================================================
   ENTER KEY
========================================================= */

function setupPreviewEnterKey() {

    const input =
        document.getElementById("previewInput");


    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendPreviewMessage();

            }

        }
    );

}


/* =========================================================
   SUGGESTION BUTTON
========================================================= */

function useSuggestion(button) {

    const input =
        document.getElementById("previewInput");


    input.value =
        button.textContent.trim();


    input.focus();

}


/* =========================================================
   TESTING
========================================================= */

function runTest() {

    const input =
        document.getElementById("testQuestion");


    const question =
        input.value.trim();


    if (!question) {

        alert(
            "Masukkan pertanyaan yang ingin diuji."
        );

        input.focus();

        return;
    }


    const result =
        findBestResponse(question);


    const test = {

        question: question,

        found: result.found,

        response: result.response,

        image: result.image || null,

        timestamp:
            new Date().toLocaleString("id-ID")

    };


    testHistory.unshift(test);


    displayTestResult(test);

    displayTestHistory();

    updateAllDisplays();

    saveToLocalStorage();


    input.value = "";

}


/* =========================================================
   TEST RESULT
========================================================= */

function displayTestResult(test) {

    const container =
        document.getElementById("testResult");


    if (test.found) {

        container.innerHTML = `

            <div class="test-success">

                <div class="test-status">

                    <i class='bx bx-check-circle'></i>

                    Rule ditemukan

                </div>

                <div>
                    Chatbot berhasil menemukan
                    knowledge base yang sesuai.
                </div>

                <div class="test-answer">

                    <strong>Respons chatbot:</strong>

                    <div id="testAnswerContent"></div>

                </div>

            </div>

        `;

    } else {

        container.innerHTML = `

            <div class="test-failed">

                <div class="test-status">

                    <i class='bx bx-x-circle'></i>

                    Rule tidak ditemukan

                </div>

                <div>

                    Chatbot belum menemukan
                    rule yang sesuai dengan pertanyaan ini.

                </div>

                <div class="test-answer">

                    <strong>Respons chatbot:</strong>

                    <div id="testAnswerContent"></div>

                </div>

            </div>

        `;

    }


    const answer =
        document.getElementById(
            "testAnswerContent"
        );


    answer.innerHTML = "";

    if (test.response) {

        const text =
            document.createElement("div");

        text.textContent =
            test.response;

        answer.appendChild(text);

    }

    if (test.image && test.image.dataUrl) {

        const image =
            document.createElement("img");

        image.className =
            "test-response-image";

        image.src =
            test.image.dataUrl;

        image.alt =
            test.image.name || "Gambar respons chatbot";

        answer.appendChild(image);

    }


    renderMath(container);

}


/* =========================================================
   TEST HISTORY
========================================================= */

function displayTestHistory() {

    const container =
        document.getElementById(
            "testHistoryContainer"
        );

    const counter =
        document.getElementById(
            "testCounter"
        );


    counter.textContent =
        `${testHistory.length} Pengujian`;


    if (testHistory.length === 0) {

        container.innerHTML = `

            <div class="empty-state small">

                <i class='bx bx-history'></i>

                <p>
                    Belum ada riwayat pengujian.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    testHistory.forEach(test => {

        const item =
            document.createElement("div");

        item.className =
            "test-item";


        const icon =
            document.createElement("div");

        icon.className =
            `test-status-icon ${
                test.found
                    ? "success"
                    : "failed"
            }`;


        icon.innerHTML =
            test.found
                ? "<i class='bx bx-check'></i>"
                : "<i class='bx bx-x'></i>";


        const question =
            document.createElement("div");

        question.className =
            "test-question";

        question.textContent =
            test.question;


        const date =
            document.createElement("div");

        date.className =
            "test-date";

        date.textContent =
            test.timestamp;


        item.appendChild(icon);

        item.appendChild(question);

        item.appendChild(date);


        container.appendChild(item);

    });

}


/* =========================================================
   UPDATE DISPLAYS
========================================================= */

function updateAllDisplays() {

    const botName =
        project.botName ||
        "MathBot";


    document.getElementById(
        "previewBotName"
    ).textContent = botName;


    document.getElementById(
        "previewRuleCount"
    ).textContent =
        rules.length;


    document.getElementById(
        "ruleCounter"
    ).textContent =
        `${rules.length} Rule`;


    document.getElementById(
        "testCounter"
    ).textContent =
        `${testHistory.length} Pengujian`;


    updateExportSummary();

}


/* =========================================================
   EXPORT SUMMARY
========================================================= */

function updateExportSummary() {

    const botName =
        project.botName ||
        "MathBot";


    document.getElementById(
        "exportBotName"
    ).textContent =
        botName;


    document.getElementById(
        "exportDescription"
    ).textContent =
        `Chatbot Pembelajaran ${project.material || "Matematika"}`;


    document.getElementById(
        "summaryGroup"
    ).textContent =
        project.groupName || "-";


    document.getElementById(
        "summaryClass"
    ).textContent =
        project.className || "-";


    document.getElementById(
        "summaryMaterial"
    ).textContent =
        project.material || "-";


    document.getElementById(
        "summaryRules"
    ).textContent =
        `${rules.length} Rule`;

}


/* =========================================================
   MATHJAX
========================================================= */

function renderMath(element) {

    if (
        window.MathJax &&
        typeof window.MathJax.typesetPromise === "function"
    ) {

        MathJax.typesetPromise(
            [element]
        ).catch(error => {

            console.warn(
                "MathJax error:",
                error
            );

        });

    }

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveToLocalStorage() {

    const data = {

        project: project,

        rules: rules,

        testHistory: testHistory

    };


    localStorage.setItem(
        "mathbotBuilderProject",
        JSON.stringify(data)
    );

}


/* =========================================================
   LOAD PROJECT
========================================================= */

function loadProject() {

    const saved =
        localStorage.getItem(
            "mathbotBuilderProject"
        );


    if (!saved) {
        return;
    }


    try {

        const data =
            JSON.parse(saved);


        if (data.project) {

            project =
                data.project;

        }


        if (Array.isArray(data.rules)) {

            rules =
                data.rules.map(rule => ({
                    ...rule,
                    image: rule.image || null
                }));

        }


        if (Array.isArray(data.testHistory)) {

            testHistory =
                data.testHistory;

        }


        document.getElementById(
            "botName"
        ).value =
            project.botName || "";


        document.getElementById(
            "groupName"
        ).value =
            project.groupName || "";


        document.getElementById(
            "className"
        ).value =
            project.className || "";


        document.getElementById(
            "material"
        ).value =
            project.material || "";


        document.getElementById(
            "members"
        ).value =
            project.members || "";


        displayRules();

        displayTestHistory();


    } catch (error) {

        console.error(
            "Gagal memuat project:",
            error
        );

    }

}


/* =========================================================
   SAVE PROJECT BUTTON
========================================================= */

function saveProject() {

    saveProjectData();

    alert(
        "Proyek berhasil disimpan di browser ini."
    );

}


/* =========================================================
   RESET PROJECT
========================================================= */

function resetProject() {

    const confirmation =
        confirm(
            "Apakah kamu yakin ingin menghapus seluruh project?\n\nSemua identitas, rule, dan riwayat testing akan dihapus."
        );


    if (!confirmation) {
        return;
    }


    localStorage.removeItem(
        "mathbotBuilderProject"
    );


    project = {

        botName: "",
        groupName: "",
        className: "",
        material: "",
        members: ""

    };


    rules = [];

    testHistory = [];

    currentStep = 1;

    editingRuleIndex = null;


    document.getElementById(
        "botName"
    ).value = "";


    document.getElementById(
        "groupName"
    ).value = "";


    document.getElementById(
        "className"
    ).value = "";


    document.getElementById(
        "material"
    ).value = "";


    document.getElementById(
        "members"
    ).value = "";


    clearRuleForm();

    displayRules();

    displayTestHistory();

    updateAllDisplays();

    resetPreviewChat();

    resetTestResult();

    goToStep(1);

}


/* =========================================================
   RESET PREVIEW
========================================================= */

function resetPreviewChat() {

    document.getElementById(
        "previewChatbox"
    ).innerHTML = `

        <div class="chat incoming">

            <div class="chat-avatar">
                <i class='bx bx-bot'></i>
            </div>

            <div class="chat-message">

                <span class="chat-name">
                    Chatbot
                </span>

                <p>
                    Hai! 👋
                    Silakan tanyakan sesuatu tentang materi
                    yang sudah dimasukkan ke dalam knowledge base.
                </p>

            </div>

        </div>

    `;

}


/* =========================================================
   RESET TEST RESULT
========================================================= */

function resetTestResult() {

    document.getElementById(
        "testResult"
    ).innerHTML = `

        <div class="empty-state">

            <i class='bx bx-search-alt'></i>

            <h3>Belum ada pengujian</h3>

            <p>
                Masukkan pertanyaan untuk mulai menguji chatbot.
            </p>

        </div>

    `;

}


/* =========================================================
   EXPORT CHATBOT
========================================================= */

function exportChatbot() {

    saveProjectData();


    if (!validateIdentity()) {
        return;
    }


    if (rules.length === 0) {

        alert(
            "Chatbot belum memiliki knowledge base."
        );

        goToStep(2);

        return;
    }


    const filename =
        createFilename();


    const chatbotHTML =
        generateChatbotHTML();


    const blob =
        new Blob(
            [chatbotHTML],
            {
                type: "text/html;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        filename;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    alert(
        `Chatbot berhasil diexport sebagai:\n${filename}`
    );

}


/* =========================================================
   CREATE FILENAME
========================================================= */

function createFilename() {

    let group =
        project.groupName ||
        "Kelompok";


    group =
        group
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_");


    let material =
        project.material ||
        "Matematika";


    material =
        material
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_");


    return `MathBot_${group}_${material}.html`;

}


/* =========================================================
   GENERATE CHATBOT HTML
========================================================= */

function generateChatbotHTML() {

    const safeRules =
        JSON.stringify(rules)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026");


    const botName =
        escapeHTML(
            project.botName ||
            "MathBot"
        );


    const groupName =
        escapeHTML(
            project.groupName ||
            "-"
        );


    const className =
        escapeHTML(
            project.className ||
            "-"
        );


    const material =
        escapeHTML(
            project.material ||
            "Matematika"
        );


    return `<!DOCTYPE html>

<html lang="id">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>${botName}</title>


<link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
    rel="stylesheet"
>


<link
    href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
    rel="stylesheet"
>


<script>

window.MathJax = {

    tex: {

        inlineMath: [
            ['\\\\(', '\\\\)']
        ],

        displayMath: [
            ['\\\\[', '\\\\]']
        ]

    },

    svg: {
        fontCache: 'global'
    }

};

</script>


<script
    async
    src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js">
</script>


<style>

* {

    box-sizing: border-box;

    margin: 0;

    padding: 0;

    font-family: 'Poppins', sans-serif;

}


body {

    min-height: 100vh;

    background:
        linear-gradient(
            135deg,
            #eff6ff,
            #f8fafc
        );

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 20px;

}


.container {

    width: 100%;

    max-width: 650px;

}


.card {

    background: white;

    border-radius: 18px;

    overflow: hidden;

    box-shadow:
        0 20px 50px
        rgba(15,23,42,0.12);

}


.header {

    background: #0724ca;

    color: white;

    padding: 20px;

    display: flex;

    align-items: center;

    gap: 12px;

}


.avatar {

    width: 45px;

    height: 45px;

    background:
        rgba(255,255,255,0.15);

    border-radius: 12px;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 25px;

}


.header h1 {

    font-size: 18px;

}


.header p {

    font-size: 10px;

    opacity: 0.8;

    margin-top: 3px;

}


.info {

    padding: 10px 18px;

    background: #eff6ff;

    color: #1e40af;

    font-size: 10px;

    border-bottom: 1px solid #dbeafe;

}


.chatbox {

    height: 500px;

    overflow-y: auto;

    padding: 22px;

    background: #f8fafc;

}


.chat {

    display: flex;

    gap: 8px;

    margin-bottom: 18px;

}


.chat.outgoing {

    justify-content: flex-end;

}


.bot-icon {

    width: 30px;

    height: 30px;

    background: #0724ca;

    color: white;

    border-radius: 8px;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

}


.message {

    max-width: 78%;

}


.message p {

    background: white;

    border: 1px solid #e2e8f0;

    border-radius:
        10px 10px 10px 0;

    padding: 11px 14px;

    font-size: 12px;

    line-height: 1.7;

}


.message img {

    display: block;

    max-width: 100%;

    max-height: 280px;

    margin-top: 8px;

    border-radius: 8px;

    border: 1px solid #e2e8f0;

    object-fit: contain;

}


.outgoing .message p {

    background: #0724ca;

    color: white;

    border: none;

    border-radius:
        10px 10px 0 10px;

}


.input-area {

    display: flex;

    gap: 6px;

    padding: 10px;

    border-top: 1px solid #e2e8f0;

}


textarea {

    flex: 1;

    border: none;

    outline: none;

    resize: none;

    padding: 11px;

    font-size: 12px;

}


.send {

    width: 45px;

    height: 45px;

    border: none;

    background: #0724ca;

    color: white;

    border-radius: 9px;

    cursor: pointer;

    font-size: 19px;

}


.footer {

    text-align: center;

    padding: 13px;

    font-size: 9px;

    color: #94a3b8;

}


@media(max-width:600px) {

    body {

        padding: 0;

    }

    .card {

        border-radius: 0;

        min-height: 100vh;

    }

    .chatbox {

        height: calc(100vh - 210px);

    }

}

</style>

</head>


<body>


<div class="container">

<div class="card">


<div class="header">

    <div class="avatar">

        <i class='bx bx-bot'></i>

    </div>

    <div>

        <h1>${botName}</h1>

        <p>
            ${className} • ${material}
        </p>
    </div>

</div>


<div class="info">

    Dibuat oleh ${groupName}

</div>


<div
    class="chatbox"
    id="chatbox"
>


<div class="chat incoming">

    <div class="bot-icon">

        <i class='bx bx-bot'></i>

    </div>

    <div class="message">

        <p>
            Hai! 👋
            Saya ${botName}.
            Silakan tanyakan sesuatu tentang
            materi ${material}.
        </p>

    </div>

</div>


</div>


<div class="input-area">

    <textarea
        id="input"
        rows="1"
        placeholder="Ketik pertanyaan..."
    ></textarea>

    <button
        class="send"
        onclick="sendMessage()"
    >

        <i class='bx bx-send'></i>

    </button>

</div>


<div class="footer">

    MathBot Builder • Rule-Based Learning

</div>


</div>

</div>


<script>


const rules = ${safeRules};


function normalizeText(text) {

    return text

        .toLowerCase()

        .trim()

        .replace(/\\s+/g, " ");

}


function findResponse(input) {

    const normalized =
        normalizeText(input);


    let bestRule = null;

    let bestScore = 0;


    rules.forEach(rule => {

        let score = 0;


        rule.keywords.forEach(keyword => {

            const key =
                normalizeText(keyword);


            if (
                normalized.includes(key)
            ) {

                score += key.length;

            }

        });


        if (score > bestScore) {

            bestScore = score;

            bestRule = rule;

        }

    });


    if (bestRule) {

        return bestRule;

    }


    return {

        response:
            "Maaf, saya belum memahami pertanyaan tersebut. Coba gunakan kata kunci lain atau tanyakan dengan cara berbeda.",

        image: null

    };

}


function addMessage(
    type,
    text,
    image
) {

    const chatbox =
        document.getElementById("chatbox");

    const chat =
        document.createElement("div");

    chat.className =
        "chat " + type;

    if (type === "incoming") {

        chat.innerHTML = \`
            <div class="bot-icon">
                <i class='bx bx-bot'></i>
            </div>

            <div class="message"></div>
        \`;

    } else {

        chat.innerHTML = \`
            <div class="message"></div>
        \`;

    }

    const message =
        chat.querySelector(".message");

    if (text) {

        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            text;

        message.appendChild(paragraph);

    }

    if (image && image.dataUrl) {

        const imageElement =
            document.createElement("img");

        imageElement.src =
            image.dataUrl;

        imageElement.alt =
            image.name || "Gambar respons chatbot";

        imageElement.loading =
            "lazy";

        message.appendChild(imageElement);

    }

    chatbox.appendChild(chat);

    chatbox.scrollTop =
        chatbox.scrollHeight;

    if (
        window.MathJax &&
        MathJax.typesetPromise
    ) {

        MathJax.typesetPromise([
            chat
        ]);

    }

}



function sendMessage() {

    const input =
        document.getElementById("input");


    const text =
        input.value.trim();


    if (!text) {

        return;

    }


    addMessage(
        "outgoing",
        text
    );


    input.value = "";


    setTimeout(() => {

        const response =
            findResponse(text);


        addMessage(
            "incoming",
            response.response || "",
            response.image || null
        );

    }, 350);

}


document
    .getElementById("input")
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


</script>


</body>

</html>`;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}