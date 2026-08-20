/* =========================================================
   JINGCARBON FUTURE COMPOSITES — 全站交互脚本
   功能：移动端菜单 / 产品下拉 / 滚动动画 / 询盘表单 / 新闻展开 / 返回顶部
   说明：中文注释供维护参考；前端展示文字均为英文
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. 顶部导航：滚动加阴影 ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
    if (backTop) backTop.classList.toggle("show", window.scrollY > 500);
  }
  var backTop = document.getElementById("backTop");

  /* ---------- 2. 移动端汉堡菜单 ---------- */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("open");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    /* 点击菜单内链接后自动收起（下拉父级除外） */
    siteNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (a.parentElement.classList.contains("has-dropdown")) return;
        siteNav.classList.remove("open");
        navToggle.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- 3. 产品下拉菜单（移动端点击展开 / 桌面端悬停） ---------- */
  document.querySelectorAll(".has-dropdown").forEach(function (li) {
    var btn = li.querySelector(".nav-drop-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      /* 仅移动端抽屉内需要手动切换（桌面端由 CSS hover 处理） */
      if (window.matchMedia("(max-width: 900px)").matches) {
        li.classList.toggle("open");
      }
    });
  });

  /* ---------- 4. 滚动进场动画 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 5. 新闻手风琴展开 ---------- */
  document.querySelectorAll(".news-item-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.closest(".news-item");
      var body = item.querySelector(".news-item-body");
      var isOpen = item.classList.contains("open");
      /* 单开模式：先收起其它项 */
      document.querySelectorAll(".news-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".news-item-body").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ---------- 6. 询盘表单：校验 + AJAX 提交 ----------
     使用 FormSubmit 免费服务转发到邮箱。
     【激活方法】首次提交后，FormSubmit 会向邮箱发送确认邮件，
     点击邮件中的 Activate 按钮即可激活，之后所有询盘都会转发到该邮箱。 */
  var form = document.getElementById("inquiryForm");
  if (form) {
    var status = document.getElementById("formStatus");

    function setInvalid(input, invalid) {
      var field = input.closest(".form-field");
      if (field) field.classList.toggle("invalid", invalid);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');
      var ok = true;

      /* 必填校验 */
      if (!name.value.trim()) { setInvalid(name, true); ok = false; } else setInvalid(name, false);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setInvalid(email, true); ok = false; } else setInvalid(email, false);
      if (!message.value.trim()) { setInvalid(message, true); ok = false; } else setInvalid(message, false);

      if (!ok) {
        status.className = "form-status err";
        status.textContent = "Please fill in the required fields correctly.";
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      /* 蜜罐字段：防机器人（正常用户不会填写） */
      var data = new FormData(form);
      data.append("_subject", "New Inquiry — JingCarbon Website");
      data.append("_template", "table");
      data.append("_captcha", "false");

      fetch("https://formsubmit.co/ajax/weoscott351@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      })
        .then(function (res) { return res.json(); })
        .then(function (res) {
          if (res.success === "true" || res.success === true) {
            status.className = "form-status ok";
            status.textContent = "Thank you! Your inquiry has been sent. We will reply within 24 hours.";
            form.reset();
          } else {
            throw new Error("failed");
          }
        })
        .catch(function () {
          status.className = "form-status err";
          status.textContent = "Submission failed. Please email us directly at weoscott351@gmail.com";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
        });
    });

    /* 输入时清除错误态 */
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () { setInvalid(el, false); });
    });
  }

  /* ---------- 7. 返回顶部 ---------- */
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 8. 页脚年份 ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
