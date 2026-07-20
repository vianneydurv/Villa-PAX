/*
  Toutes les fonctionnalités ci-dessous sont des améliorations progressives :
  le contenu et la mise en page fonctionnent déjà sans JavaScript (voir le CSS).
  Chaque bloc est isolé dans son propre try/catch : si l'un d'eux échoue,
  cela n'empêche pas les autres scripts de s'exécuter ni le site de s'afficher.
*/

// 1. Année automatique dans le footer
try {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
} catch (e) { /* le footer garde son contenu par défaut */ }

// 2. Fond de la barre de navigation au scroll (purement décoratif)
try {
  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }
} catch (e) { /* le header reste lisible grâce à son fond par défaut en CSS */ }

// 3. Menu mobile : la case à cocher CSS gère déjà l'ouverture/fermeture.
//    Le JS ajoute seulement l'état accessible (aria-expanded) et la fermeture au clic sur un lien.
try {
  var navCheckbox = document.getElementById('navToggle');
  var navList = document.getElementById('navList');
  var menuToggleLabel = document.getElementById('menuToggle');
  if (navCheckbox && menuToggleLabel) {
    navCheckbox.addEventListener('change', function () {
      menuToggleLabel.setAttribute('aria-expanded', navCheckbox.checked ? 'true' : 'false');
    });
  }
  if (navCheckbox && navList) {
    var navLinks = navList.querySelectorAll('a');
    navLinks.forEach(function (a) {
      a.addEventListener('click', function () { navCheckbox.checked = false; });
    });
  }
} catch (e) { /* le menu reste utilisable via la case à cocher CSS */ }

// 4. Diaporama de fond du hero (l'image active par défaut reste visible sans JS)
try {
  var heroLayers = document.querySelectorAll('.hero-bg-layer');
  if (heroLayers.length > 1) {
    var heroIndex = 0;
    setInterval(function () {
      heroLayers[heroIndex].classList.remove('active');
      heroIndex = (heroIndex + 1) % heroLayers.length;
      heroLayers[heroIndex].classList.add('active');
    }, 5000);
  }
} catch (e) { /* la première image de fond reste affichée en statique */ }

// 5. Mosaïque Découvrir (la première photo de chaque tuile reste visible sans JS)
try {
  var mosaicTiles = document.querySelectorAll('.mosaic-tile');
  if (mosaicTiles.length) {
    var cycleMosaic = function () {
      mosaicTiles.forEach(function (tile, i) {
        setTimeout(function () {
          try {
            var layers = tile.querySelectorAll('.mosaic-layer');
            if (layers.length < 2) return;
            var activeLayer = tile.querySelector('.mosaic-layer.active');
            var idx = Array.prototype.indexOf.call(layers, activeLayer);
            if (idx < 0) idx = 0;
            layers[idx].classList.remove('active');
            idx = (idx + 1) % layers.length;
            layers[idx].classList.add('active');
          } catch (innerErr) { /* on ignore cette tuile et on continue les autres */ }
        }, i * 1500);
      });
    };
    setInterval(cycleMosaic, 7000);
  }
} catch (e) { /* la mosaïque reste affichée avec sa première photo de chaque tuile */ }

// 6. Carrousel Thermes : empilé et 100% visible par défaut (voir CSS).
//    On ne bascule en mode "carrousel défilant" qu'une fois tout vérifié disponible.
try {
  var thermesCarousel = document.getElementById('thermesCarousel');
  var thermesTrack = document.getElementById('thermesTrack');
  var thermesNextBtn = document.getElementById('thermesNext');
  var thermesPrevBtn = document.getElementById('thermesPrev');
  var thermesDots = document.querySelectorAll('.thermes-dot');
  var thermesSlides = thermesTrack ? thermesTrack.querySelectorAll('.thermes-modern') : [];

  if (thermesCarousel && thermesTrack && thermesNextBtn && thermesPrevBtn && thermesSlides.length > 1) {
    var thermesIndex = 0;
    var thermesTimer = null;

    var goToThermesSlide = function (i) {
      thermesIndex = (i + thermesSlides.length) % thermesSlides.length;
      thermesTrack.style.transform = 'translateX(-' + (thermesIndex * 100) + '%)';
      thermesDots.forEach(function (dot, d) { dot.classList.toggle('active', d === thermesIndex); });
    };
    var startThermesTimer = function () {
      thermesTimer = setInterval(function () { goToThermesSlide(thermesIndex + 1); }, 10000);
    };
    var restartThermesTimer = function () {
      clearInterval(thermesTimer);
      startThermesTimer();
    };

    thermesNextBtn.addEventListener('click', function () {
      goToThermesSlide(thermesIndex + 1);
      restartThermesTimer();
    });
    thermesPrevBtn.addEventListener('click', function () {
      goToThermesSlide(thermesIndex - 1);
      restartThermesTimer();
    });

    // Tout est en place : on active le mode carrousel (sinon les 3 bandeaux restent empilés)
    thermesCarousel.classList.add('js-active');
    startThermesTimer();
  }
} catch (e) { /* le carrousel reste affiché en bandeaux empilés, tous lisibles */ }

// 7. Apparition douce au scroll (purement décorative — le contenu est déjà visible par défaut)
try {
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    reveals.forEach(function (el) { el.classList.add('reveal-init'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });

    // Filet de sécurité : si un élément n'a jamais déclenché l'observateur
    // (bug navigateur, élément déjà hors du flux, etc.), on force son affichage.
    setTimeout(function () {
      document.querySelectorAll('.reveal-init:not(.is-visible)').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }, 4000);
  }
} catch (e) {
  // En cas d'erreur, on annule toute tentative de masquage : tout redevient visible.
  try {
    document.querySelectorAll('.reveal-init').forEach(function (el) {
      el.classList.add('is-visible');
    });
  } catch (e2) { /* rien à faire de plus : .reveal est visible par défaut en CSS */ }
}

// 8. Formulaire de contact : ouvre le client mail avec un message pré-rempli.
//    Sans JS (ou en cas d'erreur), le formulaire garde son action mailto native.
try {
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      try {
        e.preventDefault();
        var prenomEl = document.getElementById('prenom');
        var nomEl = document.getElementById('nom');
        var emailEl = document.getElementById('email');
        var messageEl = document.getElementById('message');
        var prenom = prenomEl ? prenomEl.value : '';
        var nom = nomEl ? nomEl.value : '';
        var email = emailEl ? emailEl.value : '';
        var message = messageEl ? messageEl.value : '';
        var body = 'Prénom: ' + prenom + '\nNom: ' + nom + '\nEmail: ' + email + '\n\nMessage:\n' + message;
        window.location.href = 'mailto:reservation@villapax-labourboule.fr?subject=' +
          encodeURIComponent('Demande de réservation - Villa Pax') + '&body=' + encodeURIComponent(body);
      } catch (innerErr) {
        // En cas de souci, on laisse le formulaire se soumettre nativement (action mailto du <form>)
      }
    });
  }
} catch (e) { /* le formulaire garde son action mailto native définie en HTML */ }
