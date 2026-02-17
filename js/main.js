import { TOOL_SCHEMAS } from "./config/toolSchemas.js";

$(function () {
  (() => {
    /** Подключение slick slider */

    $(function () {
      const $slider = $(".js-orders-completed-slider").slick({
        arrows: false,
        dots: false,
        infinite: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
            },
          },
          {
            breakpoint: 570,
            settings: {
              slidesToShow: 1,
            },
          },
        ],
      });

      // --- Custom arrows (если они вне слайдера) ---
      const $prev = $(".js-slider-prev");
      const $next = $(".js-slider-next");

      $prev.on("click", () => $slider.slick("slickPrev"));
      $next.on("click", () => $slider.slick("slickNext"));

      const updateArrowsState = () => {
        const current = $slider.slick("slickCurrentSlide");
        const total = $slider.slick("getSlick").slideCount;
        const slidesToShow = $slider.slick("getSlick").options.slidesToShow;

        if (current === 0) {
          $prev.addClass("is-disabled");
        } else {
          $prev.removeClass("is-disabled");
        }

        if (current >= total - slidesToShow) {
          $next.addClass("is-disabled");
        } else {
          $next.removeClass("is-disabled");
        }
      };

      $slider.on("init", updateArrowsState);

      $slider.on("afterChange", updateArrowsState);

      updateArrowsState();
    });

    /** Input file  */

    const fileInput = document.querySelector(".js-file-input");
    const fileLabelText = document.querySelector(".js-file-label-text");
    const fileDeleteBtn = document.querySelector(".js-file-delete-btn");

    if (fileInput && fileLabelText && fileDeleteBtn) {
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
          fileLabelText.textContent = fileInput.files[0].name;
          fileDeleteBtn.classList?.add("is-visible");
        } else {
          fileLabelText.textContent = "Прикрепить файл";
          fileDeleteBtn.classList.add("is-visible");
        }
      });

      fileDeleteBtn.addEventListener("click", () => {
        fileInput.value = "";
        fileLabelText.textContent = "Прикрепить файл";
        fileDeleteBtn.classList.remove("is-visible");
      });
    }

    /** Phone input mask */

    $('input[name="phone"]').inputmask({ mask: "+7 (999) 999-99-99" });

    /** Добавить ещё позицию */

    const addBtn = document.querySelector(".js-add-position");
    const container = document.querySelector(".js-positions-container");
    const template = document.querySelector("#technical-template");

    let index = 1;
    addPosition();

    function addPosition() {
      const clone = template.content.firstElementChild.cloneNode(true);
      clone.classList.add(`js-container-position-${index}`);
      clone.dataset.positionIndex = index;

      updateAttributes(clone, index);
      resetValues(clone);

      container.appendChild(clone);

      initChoices(clone);
      updateRemoveButtons();

      /** Показать форму при первой загрузке */

      const firstToolBtn = clone.querySelector(".js-select-tool-btn");

      if (firstToolBtn) {
        firstToolBtn.classList.add("active");

        const toolType = firstToolBtn.dataset.productValue;
        const schema = TOOL_SCHEMAS[toolType];

        renderParameters(clone, schema, index);

        const title =
          firstToolBtn.dataset.parametersTitle ?? "Введите параметры";

        const parametersTitle = clone.querySelector(".js-parameters-title");
        if (parametersTitle) parametersTitle.textContent = title;
      }

      index++;
    }

    addBtn.addEventListener("click", addPosition);

    container.addEventListener("click", (e) => {
      if (e.target.closest(".js-remove-position")) {
        const blocks = container.querySelectorAll(".js-technical-information");
        if (blocks.length === 1) return;

        e.target.closest(".js-technical-information").remove();
        updateRemoveButtons();
        return;
      }

      /** Сhoose tool  */
      const toolBtn = e.target.closest(".js-select-tool-btn");

      if (toolBtn) {
        const block = toolBtn.closest(".js-technical-information");
        const positionIndex = block.dataset.positionIndex;
        const toolType = toolBtn.dataset.productValue;
        const schema = TOOL_SCHEMAS[toolType];
        renderParameters(block, schema, positionIndex);

        block
          .querySelectorAll(".js-select-tool-btn")
          .forEach((b) => b.classList.remove("active"));

        toolBtn.classList.add("active");

        const dataParametersTitle =
          toolBtn.dataset.parametersTitle ?? "Введите параметры фрезы";

        const parametersTitle = block.querySelector(".js-parameters-title");

        if (parametersTitle) {
          parametersTitle.textContent = dataParametersTitle;
        }
      }
    });

    /** Добавление данных об инструменте в форму */

    function appendToolsToFormData(form, formData) {
      const positions = form.querySelectorAll(".js-technical-information");
      positions.forEach((position) => {
        const index = position.dataset.positionIndex;

        const activeBtn = position.querySelector(".js-select-tool-btn.active");
        if (!activeBtn) return;

        const value = activeBtn.dataset.productType;

        formData.append(`positions[${index}][tool]`, value);
      });
    }

    /** Отправка формы */

    const form = document.querySelector(".js-request-form");
    const consent = document.querySelector(".js-consent");
    const consentLabel = document.querySelector(".js-consent-label");
    const consentError = document.querySelector(".js-consent-error");

    form.addEventListener("submit", (e) => {
      consentError.textContent = "";
      consentLabel.classList.remove("error");
      const formData = new FormData(form);
      appendToolsToFormData(form, formData);

      const data = {};

      for (const [key, value] of formData.entries()) {
        if (data[key]) {
          if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
        } else {
          data[key] = value;
        }
      }

      console.log(data);

      if (!consent.checked) {
        e.preventDefault();
        consentLabel.classList.add("error");
        consentError.textContent =
          "Необходимо согласие на обработку персональных данных";
        return;
      }
    });

    function updateAttributes(block, index) {
      block.querySelectorAll("[id]").forEach((el) => {
        const oldId = el.id;
        const newId = `${oldId}_${index}`;
        el.id = newId;

        const label = block.querySelector(`label[for="${oldId}"]`);
        if (label) label.setAttribute("for", newId);
      });

      block.querySelectorAll("[name]").forEach((el) => {
        el.name = `positions[${index}][${el.name}]`;
      });
    }

    function resetValues(block) {
      block.querySelectorAll("input, textarea").forEach((el) => {
        el.value = "";
      });

      block.querySelectorAll("select").forEach((el) => {
        el.selectedIndex = 0;
      });
    }

    function initChoices(block) {
      block.querySelectorAll(".js-choice").forEach((select) => {
        const instance = new Choices(select, {
          searchEnabled: false,
          searchChoices: false,
          itemSelectText: "",
          shouldSort: false,
          renderSelectedChoices: "always",
          placeholder: select.multiple ? true : false,
          placeholderValue: select.multiple
            ? select.dataset.placeholder
            : undefined,
          closeDropdownOnSelect: !select.multiple,
        });

        if (select.multiple) {
          const dropdown = instance.dropdown.element;

          dropdown.addEventListener(
            "click",
            (e) => {
              const choiceEl = e.target.closest(".choices__item--choice");
              if (!choiceEl) return;

              const value = choiceEl.dataset.value;

              if (choiceEl.getAttribute("aria-selected") === "true") {
                e.stopPropagation();
                e.preventDefault();
                instance.removeActiveItemsByValue(value);
              }
            },
            true,
          );
        }
      });
    }

    function updateRemoveButtons() {
      const blocks = container.querySelectorAll(
        ".js-technical-information:not(#technical-template .js-technical-information)",
      );

      blocks.forEach((block, i) => {
        const btn = block.querySelector(".js-remove-position");
        blocks.length === 1
          ? btn.classList.remove("active")
          : btn.classList.add("active");
      });
    }

    /** Рендер полей формы */
    function renderParameters(block, schema, positionIndex) {
      const form = block.querySelector(".production-request__parameters-form");
      form.innerHTML = "";

      schema.fields.forEach((field) => {
        let element;

        if (field.type === "select") {
          element = renderSelect(field, positionIndex);
        } else if (field.type === "textarea") {
          element = renderTextarea(field, positionIndex);
        } else {
          element = renderInput(field, positionIndex);
        }

        form.appendChild(element);
      });

      initChoices(form);
    }

    /** Рендер инпута */
    function renderInput(field, positionIndex) {
      const wrapper = document.createElement("div");
      wrapper.className = "inputbox";

      const input = document.createElement("input");
      input.type = field.type || "text";
      input.name = `positions[${positionIndex}][${field.name}]`;
      input.id = `${field.name}_${positionIndex}`;
      input.min = field.type === "number" ? field.min || 0 : undefined;
      input.placeholder = "";
      input.className = "input production-request__parameters-form-input";

      const label = document.createElement("label");
      label.className = "label noselect";
      label.setAttribute("for", input.id);
      label.textContent = field.unit
        ? `${field.label}, ${field.unit}`
        : field.label;

      wrapper.append(input, label);

      return wrapper;
    }

    /** Рендер селекта */
    function renderSelect(field, positionIndex) {
      const select = document.createElement("select");

      select.name = `positions[${positionIndex}][${field.name}]`;
      select.id = `${field.name}_${positionIndex}`;
      select.className = "js-choice";
      select.dataset.placeholder = field.label;

      if (field.multiple) {
        select.multiple = true;
      }

      if (!field.multiple) {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = field.label;
        select.appendChild(placeholder);
      }

      field.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
      });

      return select;
    }

    /** Рендер textarea */
    function renderTextarea(field, positionIndex) {
      const textarea = document.createElement("textarea");

      textarea.name = `positions[${positionIndex}][${field.name}]`;
      textarea.id = `${field.name}_${positionIndex}`;
      textarea.placeholder = field.label || "";
      textarea.className =
        "textarea production-request__parameters-form-textarea";

      return textarea;
    }
  })();
});
