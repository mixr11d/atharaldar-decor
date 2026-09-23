/**
 * مؤسسة أثر الدار - الرياض
 * Script Architecture: 100% Centralized Google Ads Tracking & Dynamic Tag Injection
 * Version: 2.1
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. ثوابت تتبع إعلانات قوقل وبيانات العميل والمطور
     ========================================================================== */
  var GOOGLE_ADS_ID = 'AW-XXXXXXXXXXX';            // معرّف إعلانات قوقل الرئيسي
  var CONVERSION_LABEL_CALL = 'XXXXXXXXXXXXXXXXXX';     // ليبل إحالة الاتصال
  var CONVERSION_LABEL_WHATSAPP = 'XXXXXXXXXXXXXXXXXX'; // ليبل إحالة الواتساب
  var CONVERSION_LABEL_FORM = 'XXXXXXXXXXXXXXXXXX';     // ليبل إحالة تعبئة النموذج

  var CLIENT_PHONE_INT = '966501439968';               // رقم صاحب الموقع (دولي)
  var DEV_PHONE_NUMBERS = ['0578539687', '966578539687', '+966578539687']; // أرقام المطور المستثناة

  /* ==========================================================================
     2. الحقن الديناميكي للتاج الرسمي لقوقل (بدون الحاجة لأي كود في الـ HTML)
     ========================================================================== */
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GOOGLE_ADS_ID);

  // حقن سكربت قوقل الرسمي تلقائياً داخل رأس الصفحة
  if (!document.getElementById('google-tag-manager-gtag')) {
    var gTagScript = document.createElement('script');
    gTagScript.id = 'google-tag-manager-gtag';
    gTagScript.async = true;
    gTagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(gTagScript);
  }

  /* ==========================================================================
     3. محرك إرسال الإحالات وفلترة استثناء المطور
     ========================================================================== */
  // استثناء نقرات المطور لمنع حرق الميزانية
  function isDeveloperTraffic(targetUrl) {
    if (!targetUrl) return false;
    for (var i = 0; i < DEV_PHONE_NUMBERS.length; i++) {
      if (targetUrl.indexOf(DEV_PHONE_NUMBERS[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  // الدالة المركزية لإرسال التحويل لقوقل أدز
  function triggerGoogleConversion(label, callback) {
    var fired = false;
    function fireCallback() {
      if (!fired) {
        fired = true;
        if (typeof callback === 'function') {
          callback();
        }
      }
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_ID + '/' + label,
        event_callback: fireCallback
      });
      // حزام أمان في حال بطء استجابة سيرفرات قوقل
      setTimeout(fireCallback, 600);
    } else {
      fireCallback();
    }
  }

  /* ==========================================================================
     4. الراصد الشامل للنقرات (Universal Click Listener) لكافة الصفحات
     ========================================================================== */
  document.addEventListener('click', function (event) {
    var targetElement = event.target.closest('a, button');
    if (!targetElement) return;

    var href = targetElement.getAttribute('href') || '';

    // تتبع أي رابط اتصال (tel:) لرقم صاحب الموقع فقط
    if (href.indexOf('tel:') === 0) {
      if (!isDeveloperTraffic(href)) {
        triggerGoogleConversion(CONVERSION_LABEL_CALL);
      }
      return;
    }

    // تتبع أي رابط واتساب (wa.me أو api.whatsapp.com) لرقم صاحب الموقع فقط
    if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
      if (!isDeveloperTraffic(href)) {
        triggerGoogleConversion(CONVERSION_LABEL_WHATSAPP);
      }
      return;
    }
  }, { capture: true, passive: true });

  /* ==========================================================================
     5. رصد إرسال كافة النماذج وتحويل البيانات للواتساب وتتبع الإحالة
     ========================================================================== */
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (form.classList.contains('ajax-lead-form') || form.id === 'quoteForm' || form.id === 'contactForm') {
      event.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري تحويل طلبكم...';
      }

      var nameInput = form.querySelector('[name="name"]');
      var phoneInput = form.querySelector('[name="phone"]');
      var serviceInput = form.querySelector('[name="service"]');
      var areaInput = form.querySelector('[name="area"]');
      var notesInput = form.querySelector('[name="notes"]');

      var name = nameInput ? nameInput.value.trim() : 'عميل كريم';
      var phone = phoneInput ? phoneInput.value.trim() : 'غير مسجل';
      var service = serviceInput ? serviceInput.value.trim() : 'طلب تسعيرة ومعاينة';
      var area = areaInput ? areaInput.value.trim() : (notesInput ? notesInput.value.trim() : 'الرياض');

      var whatsappMsg = 'مرحباً مؤسسة أثر الدار بالرياض، أود طلب تسعيرة لـ:' + '%0A'
        + '• الاسم: ' + encodeURIComponent(name) + '%0A'
        + '• رقم الجوال: ' + encodeURIComponent(phone) + '%0A'
        + '• نوع الخدمة: ' + encodeURIComponent(service) + '%0A'
        + '• الحي / التفاصيل: ' + encodeURIComponent(area);

      var waRedirectUrl = 'https://wa.me/' + CLIENT_PHONE_INT + '?text=' + whatsappMsg;

      // إطلاق إحالة النموذج أولاً ثم التحويل المباشر
      triggerGoogleConversion(CONVERSION_LABEL_FORM, function () {
        window.location.href = waRedirectUrl;
      });
    }
  });

  /* ==========================================================================
     6. وظائف الواجهة والقوائم وأزرار الصعود وتفاعل المستخدم
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    // قائمة الهاتف (Hamburger Menu)
    var menuToggle = document.querySelector('.menu-toggle');
    var navMenu = document.querySelector('.nav-menu');
    var dropdowns = document.querySelectorAll('.nav-menu .dropdown');

    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', function () {
        navMenu.classList.toggle('open');
        var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !expanded);
      });
    }

    // أكورديون الخدمات داخل الجوال
    dropdowns.forEach(function (dd) {
      var trigger = dd.querySelector('.dropdown-trigger');
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          if (window.innerWidth <= 991) {
            e.preventDefault();
            dd.classList.toggle('mobile-open');
          }
        });
      }
    });

    // زر التمرير إلى الأعلى (Scroll To Top)
    var scrollTopBtn = document.querySelector('.scroll-top-btn');
    if (scrollTopBtn) {
      window.addEventListener('scroll', function () {
        if (window.pageYOffset > 380) {
          scrollTopBtn.classList.add('visible');
        } else {
          scrollTopBtn.classList.remove('visible');
        }
      }, { passive: true });

      scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // تشغيل أكورديون الأسئلة الشائعة (FAQ)
    var faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var faqItem = btn.parentElement;
        var answer = faqItem.querySelector('.faq-answer');
        var isActive = faqItem.classList.contains('active');

        document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
          if (openItem !== faqItem) {
            openItem.classList.remove('active');
            var openAnswer = openItem.querySelector('.faq-answer');
            if (openAnswer) openAnswer.style.maxHeight = null;
          }
        });

        if (!isActive) {
          faqItem.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          faqItem.classList.remove('active');
          answer.style.maxHeight = null;
        }
      });
    });

    // تسجيل Service Worker
    if ('serviceWorker' in navigator && window.location.protocol.indexOf('http') === 0) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
      });
    }
  });

})();
