$(window).on("load", function () {
  $(".loading").fadeOut("fast");
  $(".container").fadeIn("fast");
});

$(function () {
  var rawContent = window.birthdayContent || {};
  var balloonSelectors = ["#b1", "#b2", "#b3", "#b4", "#b5", "#b6", "#b7"];
  var balloonsAligned = false;
  var balloonLoopsStarted = false;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMultilineText(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
  }

  function normalizeContent(source) {
    return {
      pageTitle: (source.seo && source.seo.pageTitle) || source.pageTitle,
      metaDescription: (source.seo && source.seo.metaDescription) || source.metaDescription,
      ogDescription: (source.seo && source.seo.ogDescription) || source.ogDescription,
      intro: source.hero || source.intro || {},
      centerpiece: source.stage || source.centerpiece || {},
      finale: source.finale || {},
      audioSrc: (source.media && source.media.audioSrc) || source.audioSrc,
      profilePhoto: (source.media && source.media.profilePhoto) || source.profilePhoto,
      photos: (source.media && source.media.galleryPhotos) || source.photos || [],
      buttons: source.controls || source.buttons || {},
      balloons: source.balloons || [],
      storyLines: source.storyLines || source.message || []
    };
  }

  function renderStoryLine(line) {
    if (line && typeof line === "object") {
      var text = escapeHtml(line.text || "");
      return "<p>" + (line.emphasis ? "<strong>" + text + "</strong>" : text) + "</p>";
    }

    return "<p>" + escapeHtml(line) + "</p>";
  }

  var content = normalizeContent(rawContent);

  function applyContent() {
    if (content.pageTitle) {
      document.title = content.pageTitle;
    }

    if (content.metaDescription) {
      $("#meta-description").attr("content", content.metaDescription);
    }

    if (content.ogDescription) {
      $("#meta-og-description").attr("content", content.ogDescription);
    }

    if (content.intro) {
      $("#intro-eyebrow").text(content.intro.eyebrow || "");
      $("#intro-title").html(renderMultilineText(content.intro.title || ""));
      $("#intro-subtitle").text(content.intro.subtitle || "");
    }

    if (content.centerpiece) {
      $("#centerpiece-kicker").text(content.centerpiece.kicker || "");
      $("#centerpiece-title").text(content.centerpiece.title || "");
    }

    if (content.finale) {
      $("#finale-kicker").text(content.finale.kicker || "");
      $("#finale-title").text(content.finale.title || "");
      $("#finale-signature").text(content.finale.signature || "");

      if (Array.isArray(content.finale.lines) && content.finale.lines.length) {
        $("#finale-body").html(
          content.finale.lines.map(function (line) {
            return "<p>" + escapeHtml(line) + "</p>";
          }).join("")
        );
      }
    }

    if (content.audioSrc) {
      $("#song-source").attr("src", content.audioSrc);
      $(".song").get(0).load();
    }

    if (content.profilePhoto) {
      $("#profile-photo").attr({
        src: content.profilePhoto.src || $("#profile-photo").attr("src"),
        alt: content.profilePhoto.alt || $("#profile-photo").attr("alt")
      });
    }

    if (Array.isArray(content.photos)) {
      content.photos.slice(0, 4).forEach(function (photo, index) {
        $("#photo-" + (index + 1)).attr({
          src: photo.src || $("#photo-" + (index + 1)).attr("src"),
          alt: photo.alt || $("#photo-" + (index + 1)).attr("alt")
        });
      });
    }

    if (content.buttons) {
      $("#turn_on").text(content.buttons.turnOn || $("#turn_on").text());
      $("#play").text(content.buttons.play || $("#play").text());
      $("#bannar_coming").text(content.buttons.banner || $("#bannar_coming").text());
      $("#balloons_flying").text(content.buttons.balloons || $("#balloons_flying").text());
      $("#cake_fadein").text(content.buttons.cake || $("#cake_fadein").text());
      $("#light_candle").text(content.buttons.candle || $("#light_candle").text());
      $("#wish_message").text(content.buttons.wish || $("#wish_message").text());
      $("#story").text(content.buttons.story || $("#story").text());
    }

    if (Array.isArray(content.balloons)) {
      content.balloons.slice(0, balloonSelectors.length).forEach(function (balloon, index) {
        $(balloonSelectors[index] + " h2").text(balloon.letter || "").css("color", balloon.color || "");
      });
    }

    if (Array.isArray(content.storyLines) && content.storyLines.length) {
      $(".message").html(
        content.storyLines.map(renderStoryLine).join("")
      );
    }
  }

  function viewportBounds() {
    var width = $(window).width();
    var height = $(window).height();
    var padding = Math.max(20, width * 0.04);

    return {
      width: width,
      height: height,
      padding: padding,
      minTop: Math.max(80, height * 0.12),
      maxTop: Math.max(180, height * 0.62)
    };
  }

  function seedBalloons() {
    balloonSelectors.forEach(function (selector, index) {
      $(selector).css({
        left: 12 + (index * 12) + "vw",
        top: "110vh"
      });
    });
  }

  function randomBalloonPosition(selector) {
    var bounds = viewportBounds();
    var $balloon = $(selector);
    var balloonWidth = $balloon.outerWidth() || 80;
    var maxLeft = Math.max(bounds.width - balloonWidth - bounds.padding, bounds.padding);
    var nextLeft = bounds.padding + (Math.random() * Math.max(maxLeft - bounds.padding, 1));
    var nextTop = bounds.minTop + (Math.random() * Math.max(bounds.maxTop - bounds.minTop, 1));

    $balloon.animate(
      {
        left: nextLeft,
        top: nextTop
      },
      10000,
      "linear",
      function () {
        if (!balloonsAligned) {
          randomBalloonPosition(selector);
        }
      }
    );
  }

  function startBalloonLoops() {
    if (balloonLoopsStarted) {
      return;
    }

    balloonLoopsStarted = true;

    balloonSelectors.forEach(function (selector, index) {
      setTimeout(function () {
        randomBalloonPosition(selector);
      }, index * 180);
    });
  }

  function alignBalloons() {
    var bounds = viewportBounds();
    var count = balloonSelectors.length;
    var balloonWidth = $(balloonSelectors[0]).outerWidth() || 80;
    var availableWidth = bounds.width - (bounds.padding * 2);
    var step = availableWidth / count;
    var rowTop = Math.min(Math.max(96, bounds.height * 0.16), 180);

    balloonSelectors.forEach(function (selector, index) {
      var nextLeft = bounds.padding + (step * index) + ((step - balloonWidth) / 2);

      $(selector).stop(true, false).animate(
        {
          left: Math.max(bounds.padding, nextLeft),
          top: rowTop
        },
        700
      );
    });
  }

  function closeLightbox() {
    $("#lightbox").fadeOut("fast", function () {
      $(this).attr("aria-hidden", "true");
    });
    $("body").removeClass("lightbox-open");
  }

  applyContent();
  seedBalloons();

  $(window).on("resize", function () {
    if (balloonsAligned) {
      alignBalloons();
    }
  });

  $("#turn_on").on("click", function () {
    $("#bulb_yellow").addClass("bulb-glow-yellow");
    $("#bulb_red").addClass("bulb-glow-red");
    $("#bulb_blue").addClass("bulb-glow-blue");
    $("#bulb_green").addClass("bulb-glow-green");
    $("#bulb_pink").addClass("bulb-glow-pink");
    $("#bulb_orange").addClass("bulb-glow-orange");
    $("body").addClass("peach");

    $(this).fadeOut("slow").delay(1800).promise().done(function () {
      $("#play").fadeIn("slow");
    });
  });

  $("#play").on("click", function () {
    var audio = $(".song")[0];

    if (audio) {
      audio.play();
    }

    $("#bulb_yellow").addClass("bulb-glow-yellow-after");
    $("#bulb_red").addClass("bulb-glow-red-after");
    $("#bulb_blue").addClass("bulb-glow-blue-after");
    $("#bulb_green").addClass("bulb-glow-green-after");
    $("#bulb_pink").addClass("bulb-glow-pink-after");
    $("#bulb_orange").addClass("bulb-glow-orange-after");
    $("body").addClass("peach-after");

    $(this).fadeOut("slow").delay(1800).promise().done(function () {
      $("#bannar_coming").fadeIn("slow");
    });
  });

  $("#bannar_coming").on("click", function () {
    $(".bannar").addClass("bannar-come");

    $(this).fadeOut("slow").delay(1200).promise().done(function () {
      $(".album-photo").fadeIn("slow");
      $(".can-zoom").fadeIn("slow");
      $("#balloons_flying").fadeIn("slow");
    });
  });

  $("#balloons_flying").on("click", function () {
    var borderTarget = -Math.max(160, $(window).width() * 0.15);

    $(".balloon-border").animate({ top: borderTarget }, 6000);
    $("#b1, #b4, #b5, #b7").addClass("balloons-rotate-behaviour-one");
    $("#b2, #b3, #b6").addClass("balloons-rotate-behaviour-two");

    balloonsAligned = false;
    startBalloonLoops();

    $(this).fadeOut("slow").delay(1600).promise().done(function () {
      $("#cake_fadein").fadeIn("slow");
    });
  });

  $("#cake_fadein").on("click", function () {
    $(".cake").fadeIn("slow");

    $(this).fadeOut("slow").delay(1400).promise().done(function () {
      $("#light_candle").fadeIn("slow");
    });
  });

  $("#light_candle").on("click", function () {
    $(".fuego").fadeIn("slow");

    $(this).fadeOut("slow").delay(800).promise().done(function () {
      $("#wish_message").fadeIn("slow");
    });
  });

  $("#wish_message").on("click", function () {
    balloonsAligned = true;
    alignBalloons();
    $(".balloons").css("opacity", "0.94");
    $(".balloons h2").fadeIn(2200);

    $(this).fadeOut("slow").delay(1600).promise().done(function () {
      $("#story").fadeIn("slow");
    });
  });

  $("#story").on("click", function () {
    var $messages = $(".message p");
    var totalMessages = $messages.length;

    $(this).fadeOut("slow");
    $messages.hide();
    $("#finale-panel").hide();

    $(".cake").fadeOut("fast").promise().done(function () {
      $(".message").fadeIn("slow", function () {
        var centerpiece = $(".centerpiece").get(0);

        if (centerpiece && typeof centerpiece.scrollIntoView === "function") {
          centerpiece.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    function messageLoop(index) {
      if (index < totalMessages - 1) {
        $messages.eq(index).fadeIn("slow").delay(1500).fadeOut("slow").promise().done(function () {
          messageLoop(index + 1);
        });
      } else {
        $messages.eq(index).fadeIn("slow").delay(1800).fadeOut("slow").promise().done(function () {
          $(".message").fadeOut("fast").promise().done(function () {
            $("#finale-panel").fadeIn("slow");
          });
        });
      }
    }

    messageLoop(0);
  });

  $(".album-photo").on("click", function () {
    var src = $(this).attr("src");
    var alt = $(this).attr("alt") || "Zoomed birthday photo";

    $("#lightbox img").attr({
      src: src,
      alt: alt
    });

    $("#lightbox")
      .attr("aria-hidden", "false")
      .css("display", "flex")
      .hide()
      .fadeIn("fast");

    $("body").addClass("lightbox-open");
  });

  $("#lightbox").on("click", function (event) {
    if (event.target !== this) {
      return;
    }

    closeLightbox();
  });

  $(document).on("keyup", function (event) {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
});
