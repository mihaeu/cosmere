import ConfluenceRenderer from "../src/ConfluenceRenderer";

describe("ConfluenceRenderer", () => {
  it("converts local image href to confluence attachment", () => {
    expect(new ConfluenceRenderer().image("example.gif", "title", "text"))
      .toBe('<ac:image><ri:attachment ri:filename="example.gif" /></ac:image>');
  });

  it("converts remote images to confluence image", () => {
    expect(new ConfluenceRenderer().image("http://example.com/example.gif", "title", "text"))
      .toBe('<ac:image><ri:url ri:value="http://example.com/example.gif" /></ac:image>');
  });

  it("converts code blocks to confluence code macro with matching language", () => {
    expect(new ConfluenceRenderer().code('System.out.println("Hello World!");', "java"))
      .toBe('<ac:structured-macro ac:name="code" ac:schema-version="1">'
        + '<ac:parameter ac:name="&quot;language">java</ac:parameter>'
        + '<ac:parameter ac:name="theme">RDark</ac:parameter>'
        + '<ac:parameter ac:name="borderStyle">solid</ac:parameter>'
        + '<ac:parameter ac:name="linenumbers">true</ac:parameter>'
        + '<ac:parameter ac:name="collapse">false</ac:parameter>'
        + '<ac:plain-text-body><![CDATA[System.out.println("Hello World!");]]></ac:plain-text-body>'
        + '</ac:structured-macro>'
        + "\n");
  });

  it("converts code blocks to confluence code macro with no syntax highlighting for incompatible languages", () => {
    expect(new ConfluenceRenderer().code('System.out.println("Hello World!");', "go++"))
      .toBe('<ac:structured-macro ac:name="code" ac:schema-version="1">'
        + '<ac:parameter ac:name="&quot;language">none</ac:parameter>'
        + '<ac:parameter ac:name="theme">RDark</ac:parameter>'
        + '<ac:parameter ac:name="borderStyle">solid</ac:parameter>'
        + '<ac:parameter ac:name="linenumbers">true</ac:parameter>'
        + '<ac:parameter ac:name="collapse">false</ac:parameter>'
        + '<ac:plain-text-body><![CDATA[System.out.println("Hello World!");]]></ac:plain-text-body>'
        + '</ac:structured-macro>'
        + "\n");
  });

  it("converts <details> tags to Confluence expand macro", () => {
    const input = `<details>
        <summary>Short Summary</summary>
        More elaborate text ` + '`with other things like monospace`' + `
      </details>`;
    expect(new ConfluenceRenderer().html(input))
        .toBe('<ac:structured-macro ac:name="expand">'
              + '<ac:parameter ac:name="title">'
               + 'Short Summary'
              + '</ac:parameter>'
              + '<ac:rich-text-body>'
                + '<ac:structured-macro ac:name="code" ac:schema-version="1">'
                + '<ac:parameter ac:name="&quot;language">'
                + 'none'
                + '</ac:parameter>'
                + '<ac:parameter ac:name="theme">'
                + 'RDark'
                + '</ac:parameter>'
                + '<ac:parameter ac:name="borderStyle">'
                + 'solid'
                + '</ac:parameter>'
                + '<ac:parameter ac:name="linenumbers">'
                + 'true'
                + '</ac:parameter>'
                + '<ac:parameter ac:name="collapse">'
                + 'false'
                + '</ac:parameter>'
                + '<ac:plain-text-body>'
                + '<![CDATA[    More elaborate text `with other things like monospace`]]>'
              + '</ac:plain-text-body>'
              + '</ac:structured-macro>'
              + "\n"
              + '</ac:rich-text-body>'
            + '</ac:structured-macro>');
  })

  it("converts <details> tags without summary to Confluence expand macro", () => {
    const input = `<details>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aliquam beatae culpa debitis deserunt dolor ea, exercitationem ipsa, magni maxime molestias nemo nostrum possimus quibusdam quo repudiandae sint veritatis voluptatibus.</details>`;
    expect(new ConfluenceRenderer().html(input))
        .toBe('<ac:structured-macro ac:name="expand">'
            + '<ac:parameter ac:name="title">'
              + 'Click here to expand ...'
            + '</ac:parameter>'
            + '<ac:rich-text-body>'
              + '<p>'
                + 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aliquam beatae culpa debitis deserunt dolor ea, exercitationem ipsa, magni maxime molestias nemo nostrum possimus quibusdam quo repudiandae sint veritatis voluptatibus.'
              + '</p>'
              + "\n"
            + '</ac:rich-text-body>'
            + '</ac:structured-macro>');
  })
});
