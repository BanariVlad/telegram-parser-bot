const { Telegraf } = require('telegraf');
const axios = require("axios");
const cheerio = require('cheerio');
const bot = new Telegraf("5818083798:AAH9gVLndl_VVuoW1LNloshih4Gh6R1DgXE");
let $ = null;

bot.launch();

bot.command("start", (ctx) => {
  ctx.reply("Select the store:", {
    reply_markup: {
      inline_keyboard: [
        [
          {text: "OrangeShop", callback_data: "orange"},
          {text: "Walmart", callback_data: "walmart"},
        ],
        [
          {text: "Check for cheapest iPhones in Atehno", callback_data: "atehno"},
        ],
      ]
    }
  });
});

bot.action("atehno", async (ctx) => {
  ctx.reply("You have selected atehno.md, good choice! Now you'll get list of the most cheapest iPhones");

  await searchAtehno(ctx);
})

bot.action("orange", async (ctx) => {
  ctx.reply("You have selected orange.md, good choice! Now there's your list of available iPhones");

  await searchOrange(ctx);
})

bot.action("walmart", async (ctx) => {
  ctx.reply("You have selected walmart.com, good choice! Now there's your list of available iPhones");

  await searchWalmart(ctx);
})

const getFormattedProducts = (items, {nameSelector, priceSelector}) => {
  return [...items].reduce((acc, item) => {
    const name = $(item).find(nameSelector).text().slice(0, 50);
    const price = $(item).find(priceSelector).text();

    return acc +=`${name} **${price} lei** \n \n`
  }, "")
}

const searchAtehno = async (ctx = null) => {
  try {
    const response = await axios.get("https://atehno.md/catalog/apple-494")

    $ = cheerio.load(response.data);

    const itemsAvailable = $($('.product-item')).not('.product-invisible');

    ctx.reply(getFormattedProducts(itemsAvailable, {
      nameSelector: ".col-sm-9 h3 a",
      priceSelector: "ins .amount"
    }));
  } catch (e) {
    ctx?.reply("Smth went wrong, please try again later");
    console.log(e)
  }
}

const searchOrange = async (ctx = null) => {
  try {
    const response = await axios.get("https://eshop.orange.md/ro/catalog/telefoane/toate-telefoanele/apple")

    $ = cheerio.load(response.data);

    const itemsAvailable = $($('.product-card')).not('[data-in-stock="false"]');

    ctx.reply(getFormattedProducts(itemsAvailable, {
      nameSelector: "h6",
      priceSelector: ".hhh"
    }));
  } catch (e) {
    ctx?.reply("Smth went wrong, please try again later");
    console.log(e)
  }
}

const searchWalmart = async (ctx = null) => {
  try {
    const response = await axios.get("https://www.walmart.com/browse/all-iphones/0/0/?_be_shelf_id=7778&_refineresult=true&facet=shelf_id%3A7778&redirectQuery=iphone&search_redirect=true&search_sort=100")

    $ = cheerio.load(response.data);

    const itemsAvailable = $('.mb1.ph1.pa0-xl.bb.b--near-white.w-25');

    ctx.reply(getFormattedProducts(itemsAvailable, {
      nameSelector: '.w_iUH7',
      priceSelector: '.b.black.mr1.lh-copy.f5.f4-l'
    }));
  } catch (e) {
    ctx?.reply("Smth went wrong, please try again later");
    console.log(e)
  }
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));