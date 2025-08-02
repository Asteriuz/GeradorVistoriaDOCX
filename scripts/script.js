let comodoCounter = 0;
let defeitoCounter = 0;
let uploadedImages = new Map();

document
  .getElementById("templateFile")
  .addEventListener("change", function (e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : "";
    document.getElementById("templateFileName").textContent = fileName;
  });

function adicionarComodo(nome = "", observacoes = "") {
  comodoCounter++;
  const comodosDiv = document.getElementById("comodos");

  const comodoDiv = document.createElement("div");
  comodoDiv.className = "comodo";
  comodoDiv.id = `comodo-${comodoCounter}`;

  comodoDiv.innerHTML = `
    <div class="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
        <div class="flex justify-between items-center mb-4">
            <div>
             <label class="block font-semibold mb-2">Nome do Cômodo</label>
              <div class="relative">
                <input
                  id="autocomplete-${comodoCounter}"
                  type="text"
                  name="comodo-nome"
                  value="${nome}"
                  class="text-lg font-medium w-auto px-2 py-1 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-indigo-400  transition mr-2"
                  autocomplete="off"
                  style="max-width: 220px; display: inline-block;"
                />
                <ul
                  id="suggestions-${comodoCounter}"
                  class="absolute w-64 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg hidden max-h-60 overflow-auto z-20 animate-fade-in"
                  style="top: 2.5rem; left: 0;"
                ></ul>
              </div>
            </div>
            <button type="button" class="remove-button cursor-pointer bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-4 py-2" onclick="removerComodo(${comodoCounter})">Remover</button>
        </div>        <div class="mb-4">
            <div class="flex justify-between items-center mb-3">
                <label class="block font-semibold">Defeitos/Observações</label>
                <button type="button" class="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-4 py-2 text-sm" onclick="adicionarDefeito(${comodoCounter})">+ Adicionar Defeito</button>
            </div>
            <div id="defeitos-${comodoCounter}" class="space-y-4">
                <!-- Defeitos serão adicionados aqui -->
            </div>
        </div>
    </div>
  `;

  if (comodosDiv.firstChild) {
    comodosDiv.insertBefore(comodoDiv, comodosDiv.firstChild);
  } else {
    comodosDiv.appendChild(comodoDiv);
  }

  // Autocomplete logic for this comodo
  const comodosList = [
    "Sala",
    "Cozinha",
    "Quarto",
    "Banheiro",
    "Varanda",
    "Garagem",
    "Escritório",
    "Lavanderia",
    "Jardim",
    "Despensa",
  ];
  const input = comodoDiv.querySelector(`#autocomplete-${comodoCounter}`);
  const suggestions = comodoDiv.querySelector(`#suggestions-${comodoCounter}`);

  function filterOptions() {
    const value = input.value.toLowerCase();
    suggestions.innerHTML = "";
    const filtered = value
      ? comodosList.filter((c) => c.toLowerCase().includes(value))
      : comodosList;
    if (filtered.length === 0) {
      suggestions.classList.add("hidden");
      return;
    }
    filtered.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c;
      li.className =
        "px-4 py-2 hover:bg-blue-100 text-gray-700 cursor-pointer transition rounded-md";
      li.onclick = () => {
        input.value = c;
        suggestions.classList.add("hidden");
      };
      suggestions.appendChild(li);
    });
    suggestions.classList.remove("hidden");
  }
  function hideOptionsWithDelay() {
    setTimeout(() => suggestions.classList.add("hidden"), 150);
  }
  input.addEventListener("input", filterOptions);
  input.addEventListener("focus", filterOptions);
  input.addEventListener("blur", hideOptionsWithDelay);

  // Adicionar primeiro defeito automaticamente
  setTimeout(() => adicionarDefeito(comodoCounter), 0);
}

function adicionarDefeito(comodoId, observacoes = "") {
  defeitoCounter++;
  const defeitosDiv = document.getElementById(`defeitos-${comodoId}`);

  const defeitoDiv = document.createElement("div");
  defeitoDiv.className =
    "defeito border border-gray-200 rounded-lg p-4 bg-gray-50";
  defeitoDiv.id = `defeito-${defeitoCounter}`;

  defeitoDiv.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <h4 class="font-medium text-gray-700">Defeito ${
        defeitosDiv.children.length + 1
      }</h4>
      <button type="button" class="text-red-500 hover:text-red-700 font-semibold text-sm cursor-pointer" onclick="removerDefeito(${defeitoCounter})">Remover</button>
    </div>
    
    <div class="mb-3">
      <textarea 
      placeholder="Descreva o defeito ou observação"
      name="defeito-observacoes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg  h-16 
      focus:outline-none focus:border-indigo-400 resize-vertical">${observacoes}</textarea>
    </div>
    
    <div>
      <label class="inline-block cursor-pointer">
        <span class="flex items-center justify-center text-sm bg-indigo-50 text-indigo-700 h-10 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 border border-indigo-200">
          📷 Adicionar Fotos
        </span>
        <input
          type="file"
          class="hidden"
          accept="image/*"
          multiple
        >
      </label>
      <div class="flex flex-wrap gap-3 mt-3" id="defeito-${defeitoCounter}-fotos-preview"></div>
    </div>
  `;

  defeitosDiv.appendChild(defeitoDiv);

  // Configurar upload de fotos para este defeito
  const fileInput = defeitoDiv.querySelector('input[type="file"]');
  const previewDiv = defeitoDiv.querySelector(
    `#defeito-${defeitoCounter}-fotos-preview`
  );

  defeitoDiv.selectedFiles = [];

  fileInput.addEventListener("change", function (e) {
    const newFiles = Array.from(e.target.files);

    const existingFiles = defeitoDiv.selectedFiles.map((f) => f.file);
    const filesToAdd = newFiles.filter(
      (nf) =>
        !existingFiles.some((ef) => ef.name === nf.name && ef.size === nf.size)
    );

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const container = document.createElement("div");
        container.className = "relative inline-block text-center";
        container.style.width = "90px";
        container.style.height = "110px";

        const filenameDiv = document.createElement("div");
        filenameDiv.className = "truncate text-xs text-gray-600 mb-1 w-full";
        filenameDiv.style.maxWidth = "85px";
        filenameDiv.textContent = file.name;

        const previewWrapper = document.createElement("div");
        previewWrapper.className = "relative";
        previewWrapper.style.display = "inline-block";
        previewWrapper.style.width = "80px";
        previewWrapper.style.height = "80px";

        const img = document.createElement("img");
        img.src = ev.target.result;
        img.className = "rounded shadow object-cover";
        img.style.width = "80px";
        img.style.height = "80px";
        img.style.display = "block";

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.innerHTML = "×";
        removeBtn.className =
          "absolute -right-2 -top-2 cursor-pointer bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 z-10 text-xs font-bold";
        removeBtn.onclick = function () {
          defeitoDiv.selectedFiles = defeitoDiv.selectedFiles.filter(
            (f) => f.file !== file
          );
          container.remove();

          const dt = new DataTransfer();
          defeitoDiv.selectedFiles.forEach((f) => dt.items.add(f.file));
          fileInput.files = dt.files;
        };

        previewWrapper.appendChild(img);
        previewWrapper.appendChild(removeBtn);
        container.appendChild(filenameDiv);
        container.appendChild(previewWrapper);
        previewDiv.appendChild(container);

        defeitoDiv.selectedFiles.push({ file });
      };
      reader.readAsDataURL(file);
    });

    fileInput.value = "";
  });
}

function removerDefeito(defeitoId) {
  const defeito = document.getElementById(`defeito-${defeitoId}`);
  if (defeito) {
    const defeitosContainer = defeito.parentElement;
    defeito.remove();

    // Renumerar os defeitos restantes
    const defeitos = defeitosContainer.children;
    Array.from(defeitos).forEach((def, index) => {
      const titulo = def.querySelector("h4");
      if (titulo) {
        titulo.textContent = `Defeito ${index + 1}`;
      }
    });
  }
}

function removerComodo(id) {
  const comodo = document.getElementById(`comodo-${id}`);
  if (comodo) {
    comodo.remove();
  }
}

function showStatus(message, isError = false) {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.className = `status ${isError ? "error" : "success"}`;
  statusDiv.style.display = "block";

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 5000);
}

document
  .getElementById("vistoriaForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    await handleFormSubmit();
  });

async function handleFormSubmit() {
  try {
    const templateFile = document.getElementById("templateFile").files[0];
    if (!templateFile) {
      throw new Error("Por favor, selecione um arquivo template DOCX");
    }

    showStatus("Gerando documento... Por favor, aguarde.");

    const dadosVistoria = {
      endereco: document.getElementById("endereco").value,
      proprietario: document.getElementById("proprietario").value,
      cliente: document.getElementById("cliente").value,
      data_vistoria: document.getElementById("data_vistoria").value,
      vistoriador: document.getElementById("vistoriador").value,
      comodos: [],
    };
    const comodos = document.querySelectorAll(".comodo");
    for (const comodo of comodos) {
      const nome = comodo.querySelector('input[name="comodo-nome"]').value;

      const comodoData = {
        nome: nome,
        defeitos: [],
      };

      // Processar cada defeito do cômodo
      const defeitos = comodo.querySelectorAll(".defeito");
      for (const defeito of defeitos) {
        const observacoes = defeito.querySelector(
          'textarea[name="defeito-observacoes"]'
        ).value;

        const defeitoData = {
          observacoes: observacoes,
          fotos: [],
        };

        // Processar fotos do defeito
        const files = defeito.selectedFiles
          ? defeito.selectedFiles.map((f) => f.file)
          : [];
        for (const file of files) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          defeitoData.fotos.push({ imagem: base64 });
        }

        comodoData.defeitos.push(defeitoData);
      }

      dadosVistoria.comodos.push(comodoData);
    }

    const templateBuffer = await templateFile.arrayBuffer();
    const zip = new PizZip(templateBuffer);
    const imageModule = new window.ImageModule({
      getImage: (tagValue) => {
        const base64 = tagValue.replace(/^data:image\/\w+;base64,/, "");
        return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      },
      getSize: () => [300, 200],
    });

    const doc = new window.docxtemplater()
      .attachModule(imageModule)
      .loadZip(zip);

    console.log("Dados da vistoria:", dadosVistoria);
    doc.render(dadosVistoria);

    const output = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(output, `Vistoria Final - ${dadosVistoria.cliente}.docx`);

    showStatus("✅ Documento de vistoria gerado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
    showStatus(`❌ Erro ao gerar documento: ${error.message}`, true);
  }
}
