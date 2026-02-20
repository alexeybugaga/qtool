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
    function showFileLabel(
      fileLabel,
      fileLabelText,
      fileDeleteBtn,
      textContent,
    ) {
      if (!fileLabel || !fileLabelText || !fileDeleteBtn) {
        return;
      }

      fileLabelText.textContent = textContent;
      fileLabel.classList.add("active");
      fileDeleteBtn.classList?.add("is-visible");
    }

    function hideFileLabel(
      fileLabel,
      fileLabelText,
      fileDeleteBtn,
      textContent,
    ) {
      if (!fileLabel || !fileLabelText || !fileDeleteBtn) {
        return;
      }

      fileLabel.classList.remove("active");
      fileLabelText.textContent = textContent;
      fileDeleteBtn.classList.remove("is-visible");
    }
    const fileInput = document.querySelector(".js-file-input");
    const fileLabel = document.querySelector(".js-file-label");
    const fileLabelText = document.querySelector(".js-file-label-text");
    const fileDeleteBtn = document.querySelector(".js-file-delete-btn");

    if (fileInput && fileLabelText && fileDeleteBtn) {
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
          showFileLabel(
            fileLabel,
            fileLabelText,
            fileDeleteBtn,
            fileInput.files[0].name,
          );
        } else {
          hideFileLabel(
            fileLabel,
            fileLabelText,
            fileDeleteBtn,
            "Прикрепить файл",
          );
        }
      });

      fileDeleteBtn.addEventListener("click", () => {
        fileInput.value = "";
        hideFileLabel(
          fileLabel,
          fileLabelText,
          fileDeleteBtn,
          "Прикрепить файл",
        );
      });
    }
    /** Tooltip position */

    const deviceWidth = window.innerWidth;

    function positionTooltip(tooltip) {
      const content = tooltip.querySelector(".field-tooltip__content");
      if (!content) return;

      const rect = tooltip.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const contentHeight = content.getBoundingClientRect().height;

      content.style.left = "";
      content.style.right = "";
      content.style.top = "";
      content.style.bottom = "";

      tooltip.classList.remove("field-tooltip--top");

      if (rect.bottom > viewportHeight - contentHeight - rect.height) {
        tooltip.classList.add("field-tooltip--top");
      }

      const tooltipRect = content.getBoundingClientRect();
      if (tooltipRect.right > viewportWidth - 5) {
        const overflow = tooltipRect.right - viewportWidth + 5;
        content.style.left = `-${overflow}px`;
      }

      if (tooltipRect.left < 5) {
        const overflow = 12 - tooltipRect.left;
        content.style.left = `${overflow}px`;
      }
    }

    // Функция для показа тултипа
    function showTooltip(tooltip) {
      tooltip.classList.add("is-active");
      positionTooltip(tooltip);
    }

    // Функция для скрытия тултипа
    function hideTooltip(tooltip) {
      tooltip.classList.remove("is-active");
    }

    document.addEventListener("mouseover", (e) => {
      const tooltip = e.target.closest(".js-field-tooltip");

      if (tooltip && !tooltip.classList.contains("is-active")) {
        showTooltip(tooltip);
      }
    });

    document.addEventListener("mouseout", (e) => {
      const tooltip = e.target.closest(".js-field-tooltip");

      if (tooltip && tooltip.classList.contains("is-active")) {
        hideTooltip(tooltip);
      }
    });

    document.addEventListener(
      "click",
      (e) => {
        const tooltip = e.target.closest(".js-field-tooltip");

        if (tooltip) {
          e.stopPropagation();
          e.preventDefault();

          if (deviceWidth > 768) {
            return;
          }

          if (tooltip.classList.contains("is-active")) {
            hideTooltip(tooltip);
          } else {
            document
              .querySelectorAll(".js-field-tooltip.is-active")
              .forEach((t) => {
                if (t !== tooltip) hideTooltip(t);
              });

            showTooltip(tooltip);
          }
        } else {
          document
            .querySelectorAll(".js-field-tooltip.is-active")
            .forEach((t) => {
              hideTooltip(t);
            });
        }
      },
      true,
    );
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

        renderParameters(clone, schema, index, toolType);

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
        const isMultiple = select.multiple;

        const instance = new Choices(select, {
          searchEnabled: false,
          searchChoices: false,
          itemSelectText: "",
          shouldSort: false,
          renderSelectedChoices: "always",
          placeholder: isMultiple ? true : false,
          placeholderValue: isMultiple ? select.dataset.placeholder : undefined,
          closeDropdownOnSelect: !isMultiple,
        });

        if (select.dataset.additional) {
          const inner = instance.containerInner.element;

          const tooltipWrapper = document.createElement("span");
          tooltipWrapper.className = "field-tooltip js-field-tooltip";
          tooltipWrapper.innerHTML = renderTooltip(select.dataset.additional);

          inner.appendChild(tooltipWrapper);
        }

        if (isMultiple) {
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
    function renderParameters(block, schema, positionIndex, toolType) {
      const form = block.querySelector(".production-request__parameters-form");
      form.innerHTML = "";

      schema.fields.forEach((field) => {
        let element;

        if (field.type === "select") {
          element = renderSelect(field, positionIndex, toolType);
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
      wrapper.className = `inputbox ${field.additional ? "additional" : ""}`;

      const input = document.createElement("input");
      input.type = field.type || "text";
      input.name = `positions[${positionIndex}][${field.name}]`;
      input.id = `${field.name}_${positionIndex}`;
      input.min = field.type === "number" ? field.min || 0 : undefined;
      input.placeholder = "";
      input.className = "input production-request__parameters-form-input";

      const label = createLabel(field, input.id);

      wrapper.append(input, label);

      return wrapper;
    }

    /** Рендер селекта */
    function renderSelect(field, positionIndex, toolType) {
      const select = document.createElement("select");

      select.name = `positions[${positionIndex}][${field.name}]`;
      select.id = `${field.name}_${positionIndex}`;
      select.className = "js-choice";
      select.dataset.placeholder = field.label;
      select.dataset.toolType = toolType;

      if (field.additional) {
        select.dataset.additional = field.additional;
      }

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
    /** Рендер label */
    function createLabel(field, id) {
      const label = document.createElement("label");
      label.className = "label noselect";
      label.setAttribute("for", id);

      const text = field.unit ? `${field.label}, ${field.unit}` : field.label;

      label.innerHTML = `
        <span>${text}</span>
        ${field.additional ? renderTooltip(field.additional) : ""}
      `;

      return label;
    }

    /** Рендер тултипа */
    function renderTooltip(text) {
      return `
        <span class="field-tooltip js-field-tooltip" tabindex="-1" type="button">
          <svg class="field-tooltip__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.00033 13.3334C9.41481 13.3334 10.7714 12.7715 11.7716 11.7713C12.7718 10.7711 13.3337 9.41451 13.3337 8.00002C13.3337 6.58553 12.7718 5.22898 11.7716 4.22878C10.7714 3.22859 9.41481 2.66669 8.00033 2.66669C6.58584 2.66669 5.22928 3.22859 4.22909 4.22878C3.2289 5.22898 2.66699 6.58553 2.66699 8.00002C2.66699 9.41451 3.2289 10.7711 4.22909 11.7713C5.22928 12.7715 6.58584 13.3334 8.00033 13.3334ZM8.00033 5.83335C7.54033 5.83335 7.16699 6.20669 7.16699 6.66669V6.73802C7.16699 6.87063 7.11431 6.99781 7.02055 7.09157C6.92678 7.18534 6.7996 7.23802 6.66699 7.23802C6.53438 7.23802 6.40721 7.18534 6.31344 7.09157C6.21967 6.99781 6.16699 6.87063 6.16699 6.73802V6.66669C6.16699 6.18046 6.36015 5.71414 6.70396 5.37032C7.04778 5.02651 7.5141 4.83335 8.00033 4.83335H8.07766C8.43631 4.83352 8.7863 4.9435 9.08059 5.1485C9.37487 5.35351 9.59932 5.6437 9.72376 5.98007C9.8482 6.31644 9.86666 6.68284 9.77666 7.03002C9.68666 7.37719 9.49251 7.68848 9.22033 7.92202L8.70699 8.36202C8.64259 8.41793 8.59084 8.48692 8.55521 8.5644C8.51957 8.64188 8.50086 8.72607 8.50033 8.81135V9.16669C8.50033 9.2993 8.44765 9.42647 8.35388 9.52024C8.26011 9.61401 8.13293 9.66669 8.00033 9.66669C7.86772 9.66669 7.74054 9.61401 7.64677 9.52024C7.553 9.42647 7.50033 9.2993 7.50033 9.16669V8.81135C7.50033 8.34669 7.70299 7.90535 8.05566 7.60335L8.56966 7.16335C8.68694 7.06283 8.77062 6.92878 8.80942 6.77927C8.84822 6.62975 8.8403 6.47194 8.7867 6.32706C8.73311 6.18219 8.63643 6.05721 8.50966 5.96894C8.38289 5.88067 8.23213 5.83335 8.07766 5.83335H8.00033ZM8.66699 10.6667C8.66699 10.8435 8.59675 11.0131 8.47173 11.1381C8.34671 11.2631 8.17714 11.3334 8.00033 11.3334C7.82351 11.3334 7.65395 11.2631 7.52892 11.1381C7.4039 11.0131 7.33366 10.8435 7.33366 10.6667C7.33366 10.4899 7.4039 10.3203 7.52892 10.1953C7.65395 10.0703 7.82351 10 8.00033 10C8.17714 10 8.34671 10.0703 8.47173 10.1953C8.59675 10.3203 8.66699 10.4899 8.66699 10.6667Z" fill="currentColor"/>
          </svg>

          <span class="field-tooltip__content">${text}</span>
        </span>
      `;
    }
  })();
});
