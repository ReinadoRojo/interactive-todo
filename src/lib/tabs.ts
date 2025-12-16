export function mountTabs() {
    try {
        document.querySelectorAll(".tab-button").forEach((button) => {
            const tabName = button.attributes["data-tab-button"].value;
            const tabContent = document.querySelector(`[data-tab="${tabName}"]`);
            const allTabs = document.querySelectorAll("[data-tab]");

            button.addEventListener("click", () => {
                allTabs.forEach((tab) => {
                    tab.classList.add("hidden");
                })
                tabContent?.classList.remove("hidden");
                document.querySelectorAll(".tab-button").forEach((btn) => {
                    btn.attributes["data-selected"].value = "false";
                });
                button.attributes["data-selected"].value = "true";
            });
        });

        console.log("Tabs mounted");
    } catch (error) {
        console.error("Error mounting tabs:", error);
    }
}

export function testAi() {
    try {
        window.ai.getExplanation("Test task").then((explanation: string) => {
            console.log("AI Explanation:", explanation);
        });

        console.log("AI test initiated");
    } catch (error) {
        console.error("Error testing AI:", error);
    }
}