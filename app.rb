require 'sinatra'
require 'json'
require 'open3'
require 'timeout'

configure do
  use Rack::Session::Cookie, 
    :key => 'ruby_puzzle.session',
    :path => '/',
    :expire_after => 2592000,
    :secret => 'b42da03e06cd6b739ec077d5d1abdb497fcd64564656c55a7345a1df80147347'
end

require_relative 'puzzles'


get '/' do
  session[:current_puzzle] ||= 1
  session[:completed] ||= []
  
  @puzzles = PUZZLES
  @current_puzzle = PUZZLES.find { |p| p[:id] == session[:current_puzzle] }
  @completed = session[:completed]
  
  erb :index
end

post '/run_code' do
  content_type :json
  
  data = JSON.parse(request.body.read)
  code = data['code']
  puzzle_id = data['puzzle_id'].to_i
  language = data['language'] || 'ruby'
  
  puzzle = PUZZLES.find { |p| p[:id] == puzzle_id }
  
  result = if language == 'javascript'
    run_javascript_code(code, puzzle[:test_cases])
  else
    run_ruby_code(code, puzzle[:test_cases])
  end
  
  if result[:success]
    session[:completed] ||= []
    unless session[:completed].include?(puzzle_id)
      session[:completed] << puzzle_id
    end
    
    if puzzle_id < PUZZLES.length
      session[:current_puzzle] = puzzle_id + 1
    end
  end
  
  result.to_json
end

post '/select_puzzle' do
  content_type :json
  
  data = JSON.parse(request.body.read)
  puzzle_id = data['puzzle_id'].to_i
  
  session[:current_puzzle] = puzzle_id
  { success: true }.to_json
end

post '/reset' do
  session.clear
  redirect '/'
end

helpers do
  def run_ruby_code(code, test_cases)
    begin
      output = ""
      success = true
      
      test_cases.each do |test|
        Timeout::timeout(2) do
          stdout, stderr, status = Open3.capture3('ruby', stdin_data: code)
          
          if stderr && !stderr.empty?
            return {
              success: false,
              output: stderr,
              error: "コードにエラーがあります"
            }
          end
          
          if stdout == test[:expected]
            output = stdout
          else
            return {
              success: false,
              output: stdout,
              expected: test[:expected],
              error: "期待される出力と違います"
            }
          end
        end
      end
      
      {
        success: true,
        output: output,
        message: "正解です！よくできました！"
      }
      
    rescue Timeout::Error
      {
        success: false,
        output: "",
        error: "実行時間が長すぎます（2秒以内）"
      }
    rescue => e
      {
        success: false,
        output: "",
        error: "エラー: #{e.message}"
      }
    end
  end

  def run_javascript_code(code, test_cases)
    begin
      output = ""
      success = true
      
      test_cases.each do |test|
        Timeout::timeout(2) do
          stdout, stderr, status = Open3.capture3('node', stdin_data: code)
          
          if stderr && !stderr.empty?
            return {
              success: false,
              output: stderr,
              error: "コードにエラーがあります"
            }
          end
          
          expected = test[:expected_js] || test[:expected]
          if stdout == expected
            output = stdout
          else
            return {
              success: false,
              output: stdout,
              expected: expected,
              error: "期待される出力と違います"
            }
          end
        end
      end
      
      {
        success: true,
        output: output,
        message: "正解です！よくできました！"
      }
      
    rescue Timeout::Error
      {
        success: false,
        output: "",
        error: "実行時間が長すぎます（2秒以内）"
      }
    rescue => e
      {
        success: false,
        output: "",
        error: "エラー: #{e.message}"
      }
    end
  end
end