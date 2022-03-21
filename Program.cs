using System;
using System.Threading;
using Websocket.Client;
using Newtonsoft.Json;


namespace csWebsocket
{
    class Program
    {
        static void Main(string[] args)
        {
            Program prg = new Program();
            Console.WriteLine("Hello, World!");

            prg.Initialize();
        }

        private void Initialize()
        {
            Console.CursorVisible = false;

            try
            {
                var exitEvent = new ManualResetEvent(false);
                var url = new Uri("ws://localhost:8080");

                using (var client = new WebsocketClient(url))
                {
                    client.ReconnectTimeout = TimeSpan.FromSeconds(30);

                    client.ReconnectionHappened.Subscribe(info =>
                    {
                        Console.WriteLine("Reconnection happened, type: " + info.Type);
                    });

                    client.MessageReceived.Subscribe(msg =>
                    {
                        //Console.WriteLine("Message received: " + msg);

                        if (msg.ToString().ToLower() == "websocket connection successful")
                        {
                            string data = "Smaug Thunder";
                            client.Send(data);
                        }
                        else {
                        string data = msg.Text;
                        //var result = JsonConvert.DeserializeObject<quote>(data);
                        Console.WriteLine(data);
                        }
                        
                    });


                    client.Start();


                    //Task.Run(() => client.Send("{ message }"));


                    exitEvent.WaitOne();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR: " + ex.ToString());
            }


            Console.ReadKey();
        }


    }
}