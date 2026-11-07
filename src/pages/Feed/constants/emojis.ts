// Şərh yazarkən smaylik paketi (mobildəki siyahının eynisi; kitabxana yoxdur). Boşluqla ayrılıb: ZWJ/variasiya işarəli emojilər parçalanmasın
export const EMOJI_CATEGORIES: { key: string; icon: string; list: string[] }[] = [
  {
    key: "face", icon: "😀",
    list: "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 😶 😐 😑 😬 🙄 😯 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕".split(" "),
  },
  {
    key: "hand", icon: "👍",
    list: "👍 👎 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 🙏 👏 🙌 👐 🤲 💪 ✍️ 👀 🧠 👊 ✊ 🤛 🤜".split(" "),
  },
  {
    key: "heart", icon: "❤️",
    list: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💯 ✨ ⭐ 🌟 🔥 💥 💫 🎉 🎊 🏆 🥇 🎯 🚀 💎".split(" "),
  },
  {
    key: "work", icon: "🔧",
    list: "🔧 🔨 🛠️ ⚙️ 🔩 🧰 ❄️ 🌡️ 💧 ⚡ 🔌 🔋 💡 🧯 🪜 🧹 🧽 🧼 🚿 🪣 🚚 🚗 🏗️ 🏠 🏢 🏭 📦 📋 📝 ✅ ☑️ ✔️ ❌ ⚠️ 🚫 ⏰ 📍 📷 📹 🔍".split(" "),
  },
  {
    key: "life", icon: "☀️",
    list: "☀️ 🌤️ ⛅ 🌧️ ⛈️ 🌈 ☕ 🍵 🍕 🍔 🍟 🍎 🍉 🍌 🍇 🍞 🥪 🍫 🍪 🌹 🌸 🌻 🌲 🐶 🐱 🐎 🎂 🍀".split(" "),
  },
];
