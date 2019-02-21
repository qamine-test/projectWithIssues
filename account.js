/* global QamineUtils */

"use strict";

(function($, window) {

  var utils = QamineUtils.getInstance();

  $(document).ready(function() {

    //Profile

    var bindProfileEdit = function(textClass, buttonClass, feedbackClass) {
      $(textClass).keyup(function() {
        $(buttonClass).prop("disabled", false);
      });

      $(buttonClass).click(function() {
        var $this = $(this);
        var postVariable = {};
        postVariable.name = $(textClass).val();

        var url = $this.data("url");
        utils.JSend(url, postVariable, function(data) {
            $(feedbackClass).showSuccess("Saved");
          }, function(error) {
            $(feedbackClass).addError(error);
          },
          "Could not save. please try again.");

      });
    };
    bindProfileEdit(".NameText", ".NameButton", ".NameFeedback");
    bindProfileEdit(".jsUsernameText", ".jsUsernameButton", ".jsUsernameFeedback");
    $(".help-tooltip").popover();

    //Vouchers
    $(".VoucherText").bind("keyup paste", function() {
      $(".VoucherButton").prop("disabled", false);
    });
    $(".VoucherButton").click(function(e) {
      e.preventDefault();

      var $this = $(this);
      var postVariable = {};
      postVariable.code = $(".VoucherText").val();

      var url = $this.data("url");
      utils.JSend(url, postVariable, function(data) {
          $(".VoucherFeedback").addSuccess("Promocode added. Your trial was extended.");
          $(".VoucherText").val("");
          $(".VoucherButton").prop("disabled", true);
        }, function(error) {
          $(".VoucherFeedback").showError(error);
        },
        "Could not add the promocode, please try again.");
    });

    $(".BtnGenerateToken").click(function() {
      var $this = $(this);

      var url = $this.data("url");
      utils.JSend(url, {}, function(data) {
          $(".ApiTokensFeedback").showSuccess("New token generated");
          location.reload();
        }, function(error) {
          $this.blur();
          $(".ApiTokensFeedback").showError(error);
        },
        "could not save. please try again.");
    });

    $(".BtnRemoveToken").click(function(e) {
      e.preventDefault();

      var $this = $(this);

      var url = $this.data("url");
      var postVariable = {};
      postVariable.tokenId = $this.data("tokenid").toString();

      utils.JSend(url, postVariable, function(data) {
          $(".ApiTokensFeedback").showSuccess("Token removed");
          $this.closest(".js-token").fadeOut();
        }, function(error) {
          $(".ApiTokensFeedback").showError(error);
        },
        "Could not remove token, please try again.");
    });


    //Notifications


    $(".jsDropdownEmail a").click(function(e) {
      e.preventDefault();

      var postVariable = {};
      postVariable.email = $(this).text();

      var url = $(".jsDropdownEmail").data("url");
      utils.post(url, postVariable, function(e) {
        if (e.error) {
          $(".jsMainEmailFeedback").showError(e.error);
        } else {
          $('.jsSelectedMainEmail').text(postVariable.email);
          $(".jsMainEmailFeedback").showSuccess("Saved");
        }
      }, function() {
        $(".jsMainEmailFeedback").showError("Could not save. Please try again.");
      });
    });

    $(".jsAccountEmail").change(function() {
      var postVariable = {};
      postVariable.emailNotification = $(this).prop('checked') ? true : false;

      var url = $(this).data("url");
      var feedback = $(this).closest('tr').find('.jsEmailFeedback');
      utils.JSend(url, postVariable, function(data) {
          feedback.showSuccess("Saved");
        }, function(error) {
          feedback.showError(error);
        },
        "Could not save. Please try again.");
    });

    $(".jsCommitEmail").change(function() {
      var postVariable = {};
      postVariable.projectId = $(this).data("project-id");
      postVariable.commitNotifications = $(this).prop('checked');

      var url = $(".jsEmailNotifications").data("url");
      var feedback = $(this).closest('tr').find('.jsEmailFeedback');
      utils.post(url, postVariable, function(e) {
        if (e.error) {
          feedback.showError(e.error);
        } else {
          feedback.showSuccess("Saved");
        }
      }, function() {
        feedback.showError("Could not save. Please try again.");
      });
    });

    function checkCookie(type) {
      var alert = Cookies.get(type);
      if(alert == "true") {
        $("." + type).removeClass("hidden").show();
      } else if(alert == "false") {
        $("." + type).hide();
      } else {
        $("." + type).removeClass("hidden").show();
        Cookies.set("CodacyStartupAlert", "true");
      }
    }

    checkCookie("CodacyStartupAlert");

    $(".CodacyStartupAlert .close").on("click", function () {
      Cookies.set("CodacyStartupAlert", "false");
    });

    $('[data-toggle="tooltip"]').tooltip();
  });

})(jQuery, window);
